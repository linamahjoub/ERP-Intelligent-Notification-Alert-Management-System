from rest_framework import serializers
from .models import Notification
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
    
    class Meta:
        model = Notification
        fields = [
            'user',
            'alert',
            'title',
            'message',
            'notification_type',
        ]
        extra_kwargs = {
            'user': {'required': False, 'allow_null': True},
            'alert': {'required': False, 'allow_null': True},
        }
    
    def create(self, validated_data):
        """Créer une notification - si pas de user spécifié, utiliser le user de l'alerte"""
        # Auto-assign user from alert if not provided
        if not validated_data.get('user') and validated_data.get('alert'):
            alert = validated_data['alert']
            validated_data['user'] = alert.user
        
        notification = super().create(validated_data)
        
        # Envoyer l'email après création
        notification.send_email_notification()
        
        return notification
