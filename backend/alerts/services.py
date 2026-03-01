from decimal import Decimal, InvalidOperation
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model

from alerts.models import Alert
from notifications.models import Notification
from stock.models import Product

User = get_user_model()


RESOLUTION_MARKER = "[RESOLVED]"


def _get_product_token(product):
    return f"[PRODUCT:{product.id}]"


def _to_decimal(value):
    if value is None or value == "":
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return None


def _compare_values(left, right, operator):
    if operator == "greater_than":
        return left > right
    if operator == "less_than":
        return left < right
    if operator == "equal_to":
        return left == right
    if operator == "not_equal":
        return left != right
    if operator == "greater_equal":
        return left >= right
    if operator == "less_equal":
        return left <= right
    return False


def _matches_categories(alert, product):
    if not alert.categories:
        return True

    product_category = (product.category or "").strip().lower()
    allowed_categories = {str(category).strip().lower() for category in alert.categories if str(category).strip()}
    return product_category in allowed_categories


def _build_trigger_message(alert, product, current_value):
    compare_to_raw = (alert.compare_to or "value").strip().lower()
    compare_to_field = {
        "min_stock": "min_quantity",
    }.get(compare_to_raw, compare_to_raw)

    if compare_to_field in {"value", ""}:
        compare_target = alert.threshold_value if alert.threshold_value is not None else "N/A"
    else:
        compare_target = getattr(product, compare_to_field, "N/A")

    return (
        f"Bonjour,\n\n"
        f"⚠️ ALERTE STOCK FAIBLE\n\n"
        f"Produit : {product.name} ({product.sku})\n"
        f"Quantité actuelle : {current_value}\n"
        f"Quantité minimum requise : {compare_target}\n\n"
        f"Actions recommandées :\n"
        f"• Remplir le stock du produit {product.name}\n"
        f"• Contactez votre fournisseur pour une commande d'urgence\n"
        f"• Vérifiez les niveaux de stock régulièrement\n\n"
        f"Cordialement,\nSmartAlerte"
    )


def _build_resolved_message(alert, product):
    return (
        f"{RESOLUTION_MARKER} {_get_product_token(product)} "
        f"Condition résolue pour le produit {product.name} ({product.sku}) "
        f"sur l'alerte {alert.name}."
    )


def _get_compare_target_value(alert, product):
    compare_to_raw = (alert.compare_to or "value").strip().lower()
    compare_to_field = {
        "min_stock": "min_quantity",
    }.get(compare_to_raw, compare_to_raw)

    if compare_to_field in {"", "value"}:
        return _to_decimal(alert.threshold_value)

    if hasattr(product, compare_to_field):
        return _to_decimal(getattr(product, compare_to_field))

    return _to_decimal(alert.threshold_value)


def ensure_auto_stock_alert():
    """Crée automatiquement une alerte 'Stock faible' générique si elle n'existe pas"""
    try:
        admin_user = User.objects.filter(is_staff=True, is_superuser=True).first()
        if not admin_user:
            admin_user = User.objects.filter(is_staff=True).first()
        if not admin_user:
            return None
        
        admin_email = admin_user.email or ""
        
        alert, created = Alert.objects.get_or_create(
            name="Stock faible - AUTO",
            user=admin_user,
            module="stock",
            defaults={
                "description": "Alerte automatique déclenchée quand un produit a une quantité inférieure au minimum",
                "severity": "high",
                "condition_type": "threshold",
                "condition_field": "quantity",
                "compare_to": "min_stock",
                "comparison_operator": "less_than",
                "threshold_value": None,
                "categories": [],
                "product_id": None,
                "notification_channels": ["email"],
                "recipients": [admin_email] if admin_email else [],
                "is_active": True,
                "repeat_until_resolved": False,
                "schedule": "immediate",
            }
        )
        
        return alert
    except Exception as e:
        import logging
        logging.error(f"Erreur lors de la création de l'alerte automatique: {e}")
        return None


def evaluate_stock_alert_for_product(alert, product):
    if not alert.is_active or alert.module != "stock":
        return False, ""

    if alert.product_id and alert.product_id != product.id:
        return False, ""

    if not _matches_categories(alert, product):
        return False, ""

    condition_field = (alert.condition_field or "quantity").strip()
    if not hasattr(product, condition_field):
        return False, ""

    current_value_raw = getattr(product, condition_field)
    current_value = _to_decimal(current_value_raw)

    if alert.condition_type == "threshold":
        compare_target = _get_compare_target_value(alert, product)
        if current_value is None or compare_target is None:
            return False, ""

        is_triggered = _compare_values(current_value, compare_target, alert.comparison_operator)
        if not is_triggered:
            return False, ""

        return True, _build_trigger_message(alert, product, current_value)

    if alert.condition_type == "absence":
        # Interprétation simple pour le stock: absence = quantité nulle
        if current_value is not None and current_value <= 0:
            return True, _build_trigger_message(alert, product, current_value)

    return False, ""


def _get_last_trigger_notification(alert, product):
    return Notification.objects.filter(
        alert=alert,
        notification_type="alert_triggered",
        message__contains=_get_product_token(product),
    ).order_by("-created_at").first()


def _get_last_resolved_notification(alert, product):
    return (
        Notification.objects.filter(
            alert=alert,
            notification_type="system",
            message__contains=RESOLUTION_MARKER,
        )
        .filter(message__contains=_get_product_token(product))
        .order_by("-created_at")
        .first()
    )


def _condition_is_currently_unresolved(alert, product):
    last_trigger = _get_last_trigger_notification(alert, product)
    if not last_trigger:
        return False

    last_resolved = _get_last_resolved_notification(alert, product)
    if not last_resolved:
        return True

    return last_trigger.created_at > last_resolved.created_at


def _schedule_interval_seconds(schedule):
    mapping = {
        "immediate": 0,
        "hourly": 3600,
        "daily": 86400,
        "weekly": 604800,
        "monthly": 2592000,
    }
    return mapping.get((schedule or "immediate").lower(), 0)


def _can_repeat_now(alert, last_trigger):
    seconds = _schedule_interval_seconds(alert.schedule)
    if seconds <= 0:
        return True
    next_allowed_at = last_trigger.created_at + timezone.timedelta(seconds=seconds)
    return timezone.now() >= next_allowed_at


def _should_create_trigger(alert, product):
    last_trigger = _get_last_trigger_notification(alert, product)
    if not last_trigger:
        return True

    if not _condition_is_currently_unresolved(alert, product):
        return True

    if not alert.repeat_until_resolved:
        return False

    return _can_repeat_now(alert, last_trigger)


def _send_alert_email_to_recipients(alert, message):
    recipients = [str(email).strip() for email in (alert.recipients or []) if "@" in str(email)]
    if alert.user and alert.user.email:
        recipients.append(alert.user.email)

    recipients = sorted(set(recipients))
    if not recipients:
        return

    send_mail(
        subject=f"Alerte déclenchée: {alert.name}",
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=recipients,
        fail_silently=True,
    )


def create_trigger_notification(alert, product, message):
    if not _should_create_trigger(alert, product):
        return False

    Notification.objects.create(
        user=alert.user,
        alert=alert,
        title=f"Alerte: {alert.name} (Produit #{product.id})",
        message=message,
        notification_type="alert_triggered",
    )

    channels = [str(channel).strip().lower() for channel in (alert.notification_channels or [])]
    if "email" in channels:
        _send_alert_email_to_recipients(alert, message)

    return True


def create_resolved_notification(alert, product):
    if not _condition_is_currently_unresolved(alert, product):
        return False

    Notification.objects.create(
        user=alert.user,
        alert=alert,
        title=f"Alerte résolue: {alert.name} (Produit #{product.id})",
        message=_build_resolved_message(alert, product),
        notification_type="system",
    )
    return True


def evaluate_alert_against_current_stock(alert):
    """Évalue une alerte stock contre les produits existants."""
    if alert.module != "stock" or not alert.is_active:
        return {"evaluated": 0, "triggered": 0}

    products = Product.objects.all()

    if alert.product_id:
        products = products.filter(id=alert.product_id)

    if alert.categories:
        products = products.filter(category__in=alert.categories)

    evaluated = 0
    triggered = 0

    for product in products:
        evaluated += 1
        is_triggered, message = evaluate_stock_alert_for_product(alert, product)
        if is_triggered:
            if create_trigger_notification(alert, product, message):
                triggered += 1
        else:
            create_resolved_notification(alert, product)

    return {"evaluated": evaluated, "triggered": triggered}


def evaluate_stock_alerts_for_product(product):
    """Évalue toutes les alertes stock actives pour un produit mis à jour."""
    alerts = Alert.objects.filter(module="stock", is_active=True)

    evaluated = 0
    triggered = 0

    for alert in alerts:
        evaluated += 1
        is_triggered, message = evaluate_stock_alert_for_product(alert, product)
        if is_triggered:
            if create_trigger_notification(alert, product, message):
                triggered += 1
        else:
            create_resolved_notification(alert, product)

    return {"evaluated": evaluated, "triggered": triggered}