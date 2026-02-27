from django.db import models
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.utils.html import escape
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
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
    
    def send_email_notification(self, subject_override=None, body_override=None):
        """Envoyer la notification par email à l'utilisateur"""
        recipients = set()

        if self.user and self.user.email:
            recipients.add(self.user.email)

        extra_emails = NotificationEmailRecipient.objects.filter(user=self.user).values_list('email', flat=True)
        for email in extra_emails:
            recipients.add(email)

        if not recipients:
            return False, "Aucun destinataire email"
        
        try:
            subject_raw = subject_override if subject_override else f"SmartAlerte - {self.title}"
            subject = subject_raw.strip() or f"SmartAlerte - {self.title}"

            body_raw = body_override if body_override else self.message
            safe_body = escape(body_raw).replace("\n", "<br>")
            
            # Créer le contenu de l'email (format professionnel)
            html_message = f"""
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:20px 0;">
        <tr>
            <td align="center">
                
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; padding:30px; border-radius:6px;">
                    
                    <!-- Header -->
                    <tr>
                        <td align="center" style="padding-bottom:20px;">
                            <h1 style="margin:0; color:#2c3e50;">SMARTNOTIFY</h1>
                        </td>
                    </tr>

                    <!-- Greeting -->
                    <tr>
                        <td style="padding-bottom:20px;">
                            <p style="margin:0 0 10px 0;">Bonjour {self.user.first_name or self.user.username},</p>
                            <p style="margin:0;">Vous avez reçu une nouvelle notification.</p>
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td style="padding:15px 0;">
                            <hr style="border:none; border-top:1px solid #dddddd;">
                        </td>
                    </tr>

                    <!-- Title -->
                    <tr>
                        <td style="padding-bottom:15px;">
                            <h2 style="margin:0; color:#34495e;">{escape(self.title)}</h2>
                        </td>
                    </tr>

                    <!-- Message -->
                    <tr>
                        <td style="padding-bottom:20px;">
                            <p style="margin:0;">{safe_body}</p>
                        </td>
                    </tr>

                    <!-- Info Table -->
                    <tr>
                        <td style="padding-bottom:20px;">
                            <table width="100%" cellpadding="8" cellspacing="0" style="background-color:#f9f9f9; border-radius:4px;">
                                <tr>
                                    <td width="30%"><strong>Type :</strong></td>
                                    <td>{self.get_notification_type_display()}</td>
                                </tr>
                                <tr>
                                    <td><strong>Date :</strong></td>
                                    <td>{self.created_at.strftime('%d/%m/%Y à %H:%M')}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Link -->
                    <tr>
                        <td style="padding-bottom:20px;">
                            <p style="margin:0 0 10px 0;">
                                Pour consulter cette notification, accédez à votre espace :
                            </p>
                            <a href="{settings.FRONTEND_URL}/notifications"
                              ">
                                {settings.FRONTEND_URL}/notifications
                            </a>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding-top:20px; border-top:1px solid #eeeeee; font-size:12px; color:#777777;">
                            <p style="margin:0 0 5px 0;">
                                Cette notification a été générée automatiquement par le système SmartAlerte.
                            </p>
                            <p style="margin:0 0 5px 0;">
                                Pour toute question, veuillez vous connecter à votre espace.
                            </p>
                            <p style="margin:10px 0 0 0;">
                                © 2026 SmartAlerte. Tous droits réservés.
                            </p>
                            <p style="margin:5px 0 0 0;">
                                Cet email a été envoyé automatiquement. Veuillez ne pas y répondre.
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
            """
            
            sent_count = send_mail(
                subject=subject,
                message=body_raw,  # Plain text fallback
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=list(recipients),
                html_message=html_message,
                fail_silently=False,
            )
            if sent_count == 0:
                return False, "Email non envoyé (SMTP)"
            return True, None
        except Exception as e:
            print(f"Erreur lors de l'envoi du mail: {e}")
            return False, str(e)


class NotificationEmailRecipient(models.Model):
    """Adresse email additionnelle pour les notifications d'un utilisateur"""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notification_recipients')
    email = models.EmailField(max_length=254)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['email']
        verbose_name = 'Notification Email Recipient'
        verbose_name_plural = 'Notification Email Recipients'
        unique_together = ['user', 'email']

    def __str__(self):
        return f"{self.user.username} -> {self.email}"

    def clean(self):
        try:
            validate_email(self.email)
        except ValidationError as exc:
            raise ValidationError({'email': exc.messages})
