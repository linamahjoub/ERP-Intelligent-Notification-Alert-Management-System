from decimal import Decimal, InvalidOperation
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
import requests

from alerts.models import Alert
from notifications.models import Notification
from stock.models import Product
from facturation.models import Invoice

User = get_user_model()


RESOLUTION_MARKER = "[RESOLVED]"


def _get_product_token(product):
    return f"[PRODUCT:{product.id}]"


def _get_invoice_token(invoice):
    return f"[INVOICE:{invoice.id}]"


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

    product_category = (product.category.name if product.category else "").strip().lower()
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
        f" ️ ALERTE STOCK FAIBLE\n\n"
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


def _build_facturation_trigger_message(alert, invoice, current_value):
    return (
        f"Bonjour,\n\n"
        f" ️ ALERTE FACTURATION\n\n"
        f"Facture : {invoice.invoice_number}\n"
        f"Client : {invoice.customer_name}\n"
        f"Montant actuel : {current_value} {invoice.currency or 'EUR'}\n"
        f"Seuil configuré : {alert.threshold_value if alert.threshold_value is not None else 'N/A'} {invoice.currency or 'EUR'}\n"
        f"Type : {invoice.get_invoice_type_display()}\n"
        f"Date facture : {invoice.invoice_date}\n\n"
        f"Cordialement,\nSmartAlerte"
    )


def _build_facturation_resolved_message(alert, invoice):
    return (
        f"{RESOLUTION_MARKER} {_get_invoice_token(invoice)} "
        f"Condition résolue pour la facture {invoice.invoice_number} "
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
            name="Stock faible ",
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


def _get_last_trigger_notification_by_token(alert, token):
    return Notification.objects.filter(
        alert=alert,
        notification_type="alert_triggered",
        message__contains=token,
    ).order_by("-created_at").first()


def _get_last_resolved_notification_by_token(alert, token):
    return (
        Notification.objects.filter(
            alert=alert,
            notification_type="system",
            message__contains=RESOLUTION_MARKER,
        )
        .filter(message__contains=token)
        .order_by("-created_at")
        .first()
    )


def _condition_is_currently_unresolved(alert, token):
    last_trigger = _get_last_trigger_notification_by_token(alert, token)
    if not last_trigger:
        return False

    last_resolved = _get_last_resolved_notification_by_token(alert, token)
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


def _should_create_trigger(alert, token):
    last_trigger = _get_last_trigger_notification_by_token(alert, token)
    if not last_trigger:
        return True

    if not _condition_is_currently_unresolved(alert, token):
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


def _extract_telegram_chat_ids(alert):
    chat_ids = []

    if alert.user and alert.user.telegram_chat_id:
        chat_ids.append(str(alert.user.telegram_chat_id).strip())

    for recipient in (alert.recipients or []):
        recipient_str = str(recipient).strip()
        if recipient_str.lower().startswith('tg:'):
            chat_id = recipient_str[3:].strip()
            if chat_id:
                chat_ids.append(chat_id)

    return sorted(set([cid for cid in chat_ids if cid]))


def _send_alert_telegram_to_recipients(alert, message):
    bot_token = getattr(settings, 'TELEGRAM_BOT_TOKEN', '')
    if not bot_token:
        return

    chat_ids = _extract_telegram_chat_ids(alert)
    if not chat_ids:
        return

    telegram_message = (
        f"\U0001F6A8 Alerte déclenchée: {alert.name}\n"
        f"Module: {alert.module}\n"
        f"Sévérité: {alert.severity}\n\n"
        f"{message}"
    )

    send_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    for chat_id in chat_ids:
        try:
            requests.post(
                send_url,
                json={
                    'chat_id': chat_id,
                    'text': telegram_message,
                },
                timeout=8,
            )
        except Exception:
            continue


def create_trigger_notification(alert, product, message):
    token = _get_product_token(product)
    if token not in message:
        message = f"{token} {message}"

    if not _should_create_trigger(alert, token):
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
    if "telegram" in channels:
        _send_alert_telegram_to_recipients(alert, message)

    return True


def create_trigger_notification_for_invoice(alert, invoice, message):
    token = _get_invoice_token(invoice)
    if token not in message:
        message = f"{token} {message}"

    if not _should_create_trigger(alert, token):
        return False

    Notification.objects.create(
        user=alert.user,
        alert=alert,
        title=f"Alerte: {alert.name} (Facture #{invoice.id})",
        message=message,
        notification_type="alert_triggered",
    )

    channels = [str(channel).strip().lower() for channel in (alert.notification_channels or [])]
    if "email" in channels:
        _send_alert_email_to_recipients(alert, message)
    if "telegram" in channels:
        _send_alert_telegram_to_recipients(alert, message)

    return True


def create_resolved_notification(alert, product):
    token = _get_product_token(product)
    if not _condition_is_currently_unresolved(alert, token):
        return False

    Notification.objects.create(
        user=alert.user,
        alert=alert,
        title=f"Alerte résolue: {alert.name} (Produit #{product.id})",
        message=_build_resolved_message(alert, product),
        notification_type="system",
    )
    return True


def create_resolved_notification_for_invoice(alert, invoice):
    token = _get_invoice_token(invoice)
    if not _condition_is_currently_unresolved(alert, token):
        return False

    Notification.objects.create(
        user=alert.user,
        alert=alert,
        title=f"Alerte résolue: {alert.name} (Facture #{invoice.id})",
        message=_build_facturation_resolved_message(alert, invoice),
        notification_type="system",
    )
    return True


def _get_invoice_field_value(invoice, condition_field):
    raw_field = (condition_field or "").strip().lower()
    field_mapping = {
        "": "total_amount",
        "quantity": "total_amount",
        "amount": "total_amount",
        "montant": "total_amount",
    }
    mapped_field = field_mapping.get(raw_field, raw_field)

    if not hasattr(invoice, mapped_field):
        return None

    return _to_decimal(getattr(invoice, mapped_field))


def _is_due_date_upcoming(invoice, days_threshold):
    """
    Vérifie si la date d'échéance est dans les N prochains jours.
    
    Args:
        invoice: Instance de facture
        days_threshold: Nombre de jours (ex: 3 = dans les 3 prochains jours)
    
    Returns:
        bool: True si due_date < today + N jours
    """
    if not invoice.due_date:
        return False
    
    try:
        days_int = int(days_threshold)
    except (ValueError, TypeError):
        return False
    
    from django.utils import timezone
    today = timezone.now().date()
    cutoff_date = today + timezone.timedelta(days=days_int)
    
    return invoice.due_date < cutoff_date


def _build_upcoming_due_message(alert, invoice, days_threshold):
    return (
        f"Bonjour,\n\n"
        f" ️ ALERTE FACTURATION - ÉCHÉANCE IMMINENTE\n\n"
        f"Facture : {invoice.invoice_number}\n"
        f"Client : {invoice.customer_name}\n"
        f"Date d'échéance : {invoice.due_date}\n"
        f"Jours restants : < {days_threshold}\n"
        f"Montant total : {invoice.total_amount} {invoice.currency or 'EUR'}\n"
        f"Statut : {invoice.get_status_display()}\n\n"
        f"Cordialement,\nSmartNotify"
    )


def evaluate_facturation_alert_for_invoice(alert, invoice):
    if not alert.is_active or alert.module != "facturation":
        return False, ""

    condition_field = (alert.condition_field or "").strip().lower()
    
    # Gestion des conditions de date d'échéance
    if condition_field in ("due_date", "échéance", "date_echéance"):
        days_threshold = alert.threshold_value
        if _is_due_date_upcoming(invoice, days_threshold):
            return True, _build_upcoming_due_message(alert, invoice, days_threshold)
        return False, ""
    
    # Gestion des conditions de montant (seuil)
    current_value = _get_invoice_field_value(invoice, alert.condition_field)
    compare_target = _to_decimal(alert.threshold_value)

    if current_value is None or compare_target is None:
        return False, ""

    is_triggered = _compare_values(current_value, compare_target, alert.comparison_operator)
    if not is_triggered:
        return False, ""

    return True, _build_facturation_trigger_message(alert, invoice, current_value)


def evaluate_alert_against_current_stock(alert):
    """Évalue une alerte stock contre les produits existants."""
    if alert.module != "stock" or not alert.is_active:
        return {"evaluated": 0, "triggered": 0}

    products = Product.objects.all()

    if alert.product_id:
        products = products.filter(id=alert.product_id)

    if alert.categories:
        category_ids = []
        for item in alert.categories:
            try:
                category_ids.append(int(item))
            except (TypeError, ValueError):
                continue
        if category_ids:
            products = products.filter(category_id__in=category_ids)

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


def evaluate_facturation_alerts_for_invoice(invoice):
    """Évalue toutes les alertes facturation actives pour une facture créée/mise à jour."""
    alerts = Alert.objects.filter(module="facturation", is_active=True)

    evaluated = 0
    triggered = 0

    for alert in alerts:
        evaluated += 1
        is_triggered, message = evaluate_facturation_alert_for_invoice(alert, invoice)
        if is_triggered:
            if create_trigger_notification_for_invoice(alert, invoice, message):
                triggered += 1
        else:
            create_resolved_notification_for_invoice(alert, invoice)

    return {"evaluated": evaluated, "triggered": triggered}


def evaluate_alert_against_current_invoices(alert):
    """Évalue une alerte facturation contre les factures existantes."""
    if alert.module != "facturation" or not alert.is_active:
        return {"evaluated": 0, "triggered": 0}

    invoices = Invoice.objects.all()

    evaluated = 0
    triggered = 0

    for invoice in invoices:
        evaluated += 1
        is_triggered, message = evaluate_facturation_alert_for_invoice(alert, invoice)
        if is_triggered:
            if create_trigger_notification_for_invoice(alert, invoice, message):
                triggered += 1
        else:
            create_resolved_notification_for_invoice(alert, invoice)

    return {"evaluated": evaluated, "triggered": triggered}