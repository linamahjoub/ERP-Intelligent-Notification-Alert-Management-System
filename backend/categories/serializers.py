from rest_framework import serializers
from .models import category
from fournisseur.serializers import SupplierSerializer


class CategorySerializer(serializers.ModelSerializer):
	supplier = SupplierSerializer(read_only=True)
	supplier_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
	
	class Meta:
		model = category
		fields = ['id', 'name', 'description', 'is_active', 'supplier_id', 'supplier', 'created_at', 'updated_at']
		read_only_fields = ['created_at', 'updated_at'] 