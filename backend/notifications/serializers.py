from rest_framework import serializers
from .models import Notification, NotificationEmailRecipient, NotificationChannelPreference
from accounts.serializers import UserSerializer
from alerts.serializers import AlertSerializer


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer pour les notifications"""
    user = UserSerializer(read_only=True)
    alert = AlertSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'user',
            'alert',
            'title',
            'message',
            'notification_type',
            'priority',
            'is_read',
            'read_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'read_at']


class CreateNotificationSerializer(serializers.ModelSerializer):
    """Serializer pour créer une notification"""

    email_subject = serializers.CharField(required=False, allow_blank=True, write_only=True)
    email_body = serializers.CharField(required=False, allow_blank=True, write_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'user',
            'alert',
            'title',
            'message',
            'notification_type',
            'priority',
            'email_subject',
            'email_body',
        ]
        extra_kwargs = {
            'user': {'required': False, 'allow_null': True},
            'alert': {'required': False, 'allow_null': True},
            'title': {'required': False, 'allow_blank': True, 'allow_null': True},
            'message': {'required': False, 'allow_blank': True, 'allow_null': True},
            'priority': {'required': False},
        }
    
    def create(self, validated_data):
        """Créer une notification - si pas de user spécifié, utiliser le user de l'alerte"""
        email_subject = validated_data.pop('email_subject', '')
        email_body = validated_data.pop('email_body', '')
        # Auto-assign user from alert if not provided
        if not validated_data.get('user') and validated_data.get('alert'):
            alert = validated_data['alert']
            validated_data['user'] = alert.user
        
        notification = super().create(validated_data)

        prefs, _ = NotificationChannelPreference.objects.get_or_create(user=notification.user)
        email_success = False
        telegram_success = False
        email_error_message = None
        
        if prefs.email_enabled:
            email_success, email_error_message = notification.send_email_notification(
                subject_override=email_subject,
                body_override=email_body,
            )

        if prefs.telegram_enabled:
            telegram_success, _ = notification.send_telegram_notification(
                body_override=email_body,
            )

        has_external_channel = prefs.email_enabled or prefs.telegram_enabled
        if has_external_channel and not email_success and not telegram_success:
            raise serializers.ValidationError({
                'notification': (
                    "Erreur lors de l'envoi des notifications email/telegram: "
                    f"{email_error_message or 'Aucun canal disponible'}"
                )
            })
        
        return notification


class NotificationEmailRecipientSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationEmailRecipient
        fields = ['id', 'email']
        read_only_fields = ['id']
