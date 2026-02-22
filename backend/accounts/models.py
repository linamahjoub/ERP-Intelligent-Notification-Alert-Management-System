from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class CustomUser(AbstractUser):
    """
    Modèle utilisateur personnalisé avec champs supplémentaires
    """
    ROLE_CHOICES = [
        ('responsable_stock', 'Responsable Stock'),
        ('commercial', 'Commercial'),
        ('achats', 'Achats'),
        ('employe', 'Employé'),
        ('client', 'Client'),
        ('fournisseur', 'Fournisseur'),
    ]
    email = models.EmailField(
        _('email address'),
        unique=True,
        error_messages={
            'unique': _("Un utilisateur avec cet email existe déjà."),
        }
    )
    
    # Champs de rôle
    is_primary_admin = models.BooleanField(
        _('primary admin status'),
        default=False,
        help_text=_('Désigne si cet utilisateur est l\'administrateur principal.')
    )
    
    # Champs supplémentaires
    phone_number = models.CharField(
        _('phone number'),
        max_length=20,
        blank=True,
        null=True
    )

    telegram_chat_id = models.CharField(
        _('telegram chat id'),
        max_length=64,
        blank=True,
        null=True,
        help_text=_('Identifiant Telegram pour recevoir des notifications.')
    )

    role = models.CharField(
        _('role'),
        max_length=20,
        choices=ROLE_CHOICES,
        default='employe'
    )
    
    company = models.CharField(
        _('company'),
        max_length=100,
        blank=True,
        null=True
    )
    
    profile_picture = models.ImageField(
        _('profile picture'),
        upload_to='profile_pictures/',
        blank=True,
        null=True
    )
    
    created_at = models.DateTimeField(
        _('created at'),
        auto_now_add=True
    )
    
    updated_at = models.DateTimeField(
        _('updated at'),
        auto_now=True
    )
    
    # Email comme identifiant de connexion
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        ordering = ['-date_joined']
    
    def __str__(self):
        return self.email
    
    @property
    def full_name(self):
        """Retourne le nom complet de l'utilisateur"""
        return f"{self.first_name} {self.last_name}".strip() or self.username
    
    @property
    def is_admin(self):
        """Vérifie si l'utilisateur est admin"""
        return self.is_superuser or self.is_staff or self.is_primary_admin
    
    def save(self, *args, **kwargs):
        # Le premier utilisateur créé devient automatiquement superuser
        if not CustomUser.objects.exists():
            self.is_superuser = True
            self.is_staff = True
            self.is_primary_admin = True
        super().save(*args, **kwargs)