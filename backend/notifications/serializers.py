from rest_framework import serializers
from .models import Notification, NotificationEmailRecipient
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
            'email_subject',
            'email_body',
        ]
        extra_kwargs = {
            'user': {'required': False, 'allow_null': True},
            'alert': {'required': False, 'allow_null': True},
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
        
        # Envoyer l'email après création
        success, error_message = notification.send_email_notification(
            subject_override=email_subject,
            body_override=email_body,
        )
        if not success:
            raise serializers.ValidationError({
                'email': f"Erreur lors de l'envoi de l'email: {error_message}"
            })
        
        return notification


class NotificationEmailRecipientSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationEmailRecipient
        fields = ['id', 'email']
        read_only_fields = ['id']
