from rest_framework import serializers
from .models import Supplier


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = [
            "id",
            "name",
            "contact_name",
            "email",
            "phone",
            "address",
            "city",
            "country",
            "is_active",
            "created_at",
            "updated_at",
        ]
        
