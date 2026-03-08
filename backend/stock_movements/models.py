from django.db import models
from django.contrib.auth import get_user_model
from stock.models import Product

User = get_user_model()


class StockMovement(models.Model):
    """Modèle pour tracker tous les mouvements de stock"""
    
    MOVEMENT_TYPE_CHOICES = [
        ('entry', 'Entrée'),
        ('exit', 'Sortie'),
        ('transfer', 'Transfert'),
    ]
    
    ENTRY_REASON_CHOICES = [
        ('purchase', 'Achat'),
        ('return', 'Retour'),
        ('adjustment', 'Ajustement'),
        ('other', 'Autre'),
    ]
    
    EXIT_REASON_CHOICES = [
        ('sale', 'Vente'),
        ('loss', 'Perte'),
        ('production', 'Production'),
        ('damage', 'Dommage'),
        ('adjustment', 'Ajustement'),
        ('other', 'Autre'),
    ]
    
    # Champs principaux
    movement_type = models.CharField(
        max_length=10,
        choices=MOVEMENT_TYPE_CHOICES,
        help_text="Type de mouvement: Entrée, Sortie ou Transfert"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='movements'
    )
    quantity = models.PositiveIntegerField(
        help_text="Quantité du mouvement"
    )
    
    # Raisons du mouvement
    entry_reason = models.CharField(
        max_length=20,
        choices=ENTRY_REASON_CHOICES,
        blank=True,
        null=True,
        help_text="Raison si c'est une entrée"
    )
    exit_reason = models.CharField(
        max_length=20,
        choices=EXIT_REASON_CHOICES,
        blank=True,
        null=True,
        help_text="Raison si c'est une sortie"
    )
    
    # Pour les transferts entre entrepôts
    warehouse_from = models.CharField(
        max_length=255,
        blank=True,
        help_text="Entrepôt source (pour transfert)"
    )
    warehouse_to = models.CharField(
        max_length=255,
        blank=True,
        help_text="Entrepôt destination (pour transfert)"
    )
    
    # Responsabilité
    responsible = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stock_movements',
        help_text="Utilisateur qui a effectué le mouvement"
    )
    
    # Détails additionnels
    reference = models.CharField(
        max_length=100,
        blank=True,
        help_text="Numéro de commande, de bon de livraison, etc."
    )
    notes = models.TextField(
        blank=True,
        help_text="Notes supplémentaires sur le mouvement"
    )
    
    # Audit
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Mouvement de stock"
        verbose_name_plural = "Mouvements de stock"
    
    def __str__(self):
        return f"{self.get_movement_type_display()} - {self.product.name} ({self.quantity}) - {self.created_at.strftime('%d/%m/%Y %H:%M')}"
    
    def get_reason(self):
        """Retourne la raison du mouvement"""
        if self.movement_type == 'entry':
            return self.get_entry_reason_display()
        elif self.movement_type == 'exit':
            return self.get_exit_reason_display()
        return "Transfert"
