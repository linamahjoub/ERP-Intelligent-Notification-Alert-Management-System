from rest_framework import serializers
from .models import Alert

class AlertSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Alert
        fields = [
            'id', 'user', 'user_name', 'user_email',
            'name', 'description', 'module', 'severity',
            'condition_type', 'threshold_value', 'comparison_operator',
            'notification_channels', 'recipients',
            'schedule', 'custom_schedule',
            'is_active', 'tags',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'user_name', 'user_email', 'created_at', 'updated_at']
