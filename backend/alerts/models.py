from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Alert(models.Model):
    """Modèle pour les règles d'alerte"""
    
    SEVERITY_CHOICES = [
        ('critical', 'Critique'),
        ('high', 'Haute'),
        ('medium', 'Moyenne'),
        ('low', 'Basse'),
    ]
    
    CONDITION_TYPES = [
        ('threshold', 'Seuil'),
        ('absence', 'Absence de données'),
        ('anomaly', 'Détection d\'anomalie'),
        ('trend', 'Tendance'),
    ]
    
    COMPARISON_OPERATORS = [
        ('greater_than', 'Supérieur à'),
        ('less_than', 'Inférieur à'),
        ('equal_to', 'Égal à'),
        ('not_equal', 'Différent de'),
        ('greater_equal', 'Supérieur ou égal'),
        ('less_equal', 'Inférieur ou égal'),
    ]
    
    SCHEDULE_CHOICES = [
        ('immediate', 'Temps réel'),
        ('hourly', 'Toutes les heures'),
        ('daily', 'Quotidien'),
        ('weekly', 'Hebdomadaire'),
        ('monthly', 'Mensuel'),
    ]
    
    # Champs de base
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='alerts')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    
    # Modules et sévérité
    module = models.CharField(
        max_length=50,
        choices=[
            ('stock', 'Stock'),
            ('crm', 'CRM'),
            ('facturation', 'Facturation'),
            ('gmao', 'GMAO'),
            ('gpao', 'GPAO'),
            ('rh', 'RH'),
        ]
    )
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='medium')
    
    # Conditions
    condition_type = models.CharField(max_length=50, choices=CONDITION_TYPES, default='threshold')
    threshold_value = models.CharField(max_length=255, blank=True, null=True)
    comparison_operator = models.CharField(
        max_length=50,
        choices=COMPARISON_OPERATORS,
        default='greater_than'
    )
    
    # Notifications
    notification_channels = models.JSONField(default=list, help_text="Liste des canaux de notification")
    recipients = models.JSONField(default=list, help_text="Liste des destinataires")
    
    # Calendrier
    schedule = models.CharField(max_length=20, choices=SCHEDULE_CHOICES, default='immediate')
    custom_schedule = models.CharField(max_length=255, blank=True, null=True)
    
    # Statut
    is_active = models.BooleanField(default=True)
    tags = models.JSONField(default=list, blank=True)
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Alerte'
        verbose_name_plural = 'Alertes'
    
    def __str__(self):
        return f"{self.name} ({self.module})"
