from rest_framework import serializers
from .models import category


class CategorySerializer(serializers.ModelSerializer):
	class Meta:
		model = category
		fields = ['id', 'name', 'description', 'is_active', 'created_at', 'updated_at'] 