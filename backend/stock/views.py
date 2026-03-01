from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from activity.models import ActivityLog
from alerts.services import evaluate_stock_alerts_for_product, ensure_auto_stock_alert
from notifications.models import Notification
from django.core.mail import send_mail
from django.conf import settings
from .models import Product
from .serializers import ProductSerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Seul l'admin peut créer des produits
        if not self.request.user.is_staff and not self.request.user.is_superuser:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Seuls les administrateurs peuvent créer des produits")
        
        product = serializer.save()

        ActivityLog.objects.create(
            actor=self.request.user,
            action_type=ActivityLog.ACTION_PRODUCT_CREATED,
            title=f"Nouveau produit: {product.name}",
            description=f"SKU: {product.sku} | Quantite: {product.quantity}",
        )

        ensure_auto_stock_alert()
        evaluate_stock_alerts_for_product(product)

    def perform_update(self, serializer):
        product = serializer.save()
        user = self.request.user
        
        # Vérifier si la quantité est inférieure au minimum
        if product.quantity < product.min_quantity:
            # Créer une notification pour l'utilisateur qui a modifié le produit
            message = (
                f"Bonjour,\n\n"
                f"⚠️ ALERTE STOCK FAIBLE\n\n"
                f"Produit : {product.name} ({product.sku})\n"
                f"Quantité actuelle : {product.quantity}\n"
                f"Quantité minimum requise : {product.min_quantity}\n\n"
                f"Actions recommandées :\n"
                f"• Remplir le stock du produit {product.name}\n"
                f"• Contactez votre fournisseur pour une commande d'urgence\n"
                f"• Vérifiez les niveaux de stock régulièrement\n\n"
                f"Cordialement,\nSmartAlerte"
            )
            
            # Créer la notification
            Notification.objects.create(
                user=user,
                alert=None,
                title=f"⚠️ Stock faible - {product.name}",
                message=message,
                notification_type="alert_triggered",
            )
            
            # Envoyer un email si l'utilisateur a une adresse email
            if user.email:
                try:
                    send_mail(
                        subject=f"⚠️ Alerte Stock Faible - {product.name}",
                        message=message,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[user.email],
                        fail_silently=True,
                    )
                except Exception as e:
                    import logging
                    logging.error(f"Erreur envoi email à {user.email}: {e}")
        
        ensure_auto_stock_alert()
        evaluate_stock_alerts_for_product(product)

    def perform_destroy(self, instance):
        # Seul l'admin peut supprimer des produits
        if not self.request.user.is_staff and not self.request.user.is_superuser:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Seuls les administrateurs peuvent supprimer des produits")
        
        instance.delete()
