from rest_framework import serializers
from .models import Alert

class AlertSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = Alert
        fields = [
            'id', 'user', 'user_name', 'user_email',
            'name', 'description', 'module', 'severity',
            'condition_type', 'threshold_value', 'comparison_operator',
            'condition_field', 'compare_to', 'categories',
            'product', 'product_name',
            'notification_channels', 'recipients',
            'schedule', 'custom_schedule', 'repeat_until_resolved',
            'is_active', 'tags',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'user_name', 'user_email', 'created_at', 'updated_at']
