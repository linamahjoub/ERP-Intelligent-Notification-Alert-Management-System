from django.db import models
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from alerts.models import Alert

User = get_user_model()


class Notification(models.Model):
    """Modèle pour les notifications reçues par les utilisateurs"""
    
    NOTIFICATION_TYPES = [
        ('alert_triggered', 'Alerte déclenchée'),
        ('alert_updated', 'Alerte mise à jour'),
        ('system', 'Notification système'),
    ]
    
    # Relations
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    alert = models.ForeignKey(Alert, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    
    # Contenu
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES, default='alert_triggered')
    
    # Statut de lecture
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"
    
    def mark_as_read(self):
        """Marquer la notification comme lue"""
        if not self.is_read:
            from django.utils import timezone
            self.is_read = True
            self.read_at = timezone.now()
            self.save()
            return True
        return False
    
    def mark_as_unread(self):
        """Marquer la notification comme non lue"""
        if self.is_read:
            self.is_read = False
            self.read_at = None
            self.save()
            return True
        return False
    
    def send_email_notification(self):
        """Envoyer la notification par email à l'utilisateur"""
        if not self.user or not self.user.email:
            return False
        
        try:
            subject = f"SmartAlerte - {self.title}"
            
            # Créer le contenu HTML de l'email
            html_message = f"""
            <html>
                
                <body>
                    <div class="container">
                     
                        <div class="content">
                            <p>Bonjour <strong>{self.user.first_name or self.user.username}</strong>,</p>
                            
                            <div class="message">
                                {self.message}
                            </div>
                            
                            <div class="alert-info">
                                <strong>Type:</strong> {self.get_notification_type_display()}<br>
                                <strong>Date:</strong> {self.created_at.strftime('%d/%m/%Y à %H:%M')}
                            </div>
                            
                            <p style="margin-top: 20px;">
                                <a href="{settings.FRONTEND_URL}/notifications" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                                    Voir dans SmartAlerte
                                </a>
                            </p>
                        </div>
                        <div class="footer">
                            <p>© 2026 SmartAlerte. Tous droits réservés.</p>
                            <p>Cet email a été envoyé automatiquement. Veuillez ne pas y répondre.</p>
                        </div>
                    </div>
                </body>
            </html>
            """
            
            send_mail(
                subject=subject,
                message=self.message,  # Plain text fallback
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[self.user.email],
                html_message=html_message,
                fail_silently=True,
            )
            return True
        except Exception as e:
            print(f"Erreur lors de l'envoi du mail: {e}")
            return False
