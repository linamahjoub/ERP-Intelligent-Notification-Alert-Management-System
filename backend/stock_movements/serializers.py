from rest_framework import serializers
from .models import StockMovement
from stock.models import Product
from django.contrib.auth import get_user_model

User = get_user_model()


class ProductSimpleSerializer(serializers.ModelSerializer):
    """Sérialiseur simple pour le produit dans les mouvements"""
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'sku', 'category']


class UserSimpleSerializer(serializers.ModelSerializer):
    """Sérialiseur simple pour l'utilisateur"""
    
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'full_name', 'email']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


class StockMovementSerializer(serializers.ModelSerializer):
    """Sérialiseur complet pour les mouvements de stock"""
    
    product = ProductSimpleSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        write_only=True,
        source='product'
    )
    
    responsible = UserSimpleSerializer(read_only=True)
    responsible_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
        source='responsible'
    )
    
    movement_type_display = serializers.CharField(
        source='get_movement_type_display',
        read_only=True
    )
    entry_reason_display = serializers.CharField(
        source='get_entry_reason_display',
        read_only=True,
        required=False
    )
    exit_reason_display = serializers.CharField(
        source='get_exit_reason_display',
        read_only=True,
        required=False
    )
    reason = serializers.SerializerMethodField()
    
    class Meta:
        model = StockMovement
        fields = [
            'id',
            'movement_type',
            'movement_type_display',
            'product',
            'product_id',
            'quantity',
            'entry_reason',
            'entry_reason_display',
            'exit_reason',
            'exit_reason_display',
            'reason',
            'warehouse_from',
            'warehouse_to',
            'responsible',
            'responsible_id',
            'reference',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_reason(self, obj):
        """Retourne la raison du mouvement"""
        return obj.get_reason()
    
    def validate(self, data):
        """Valide les données du mouvement"""
        movement_type = data.get('movement_type')
        entry_reason = data.get('entry_reason')
        exit_reason = data.get('exit_reason')
        warehouse_from = data.get('warehouse_from')
        warehouse_to = data.get('warehouse_to')
        
        if movement_type == 'entry' and not entry_reason:
            raise serializers.ValidationError(
                "Une raison d'entrée doit être spécifiée pour un mouvement d'entrée."
            )
        
        if movement_type == 'exit' and not exit_reason:
            raise serializers.ValidationError(
                "Une raison de sortie doit être spécifiée pour un mouvement de sortie."
            )
        
        if movement_type == 'transfer':
            if not warehouse_from or not warehouse_to:
                raise serializers.ValidationError(
                    "Les entrepôts source et destination doivent être spécifiés pour un transfert."
                )
            if warehouse_from == warehouse_to:
                raise serializers.ValidationError(
                    "L'entrepôt source et destination ne peuvent pas être les mêmes."
                )
        
        return data


class StockMovementListSerializer(serializers.ModelSerializer):
    """Sérialiseur allégé pour les listes de mouvements"""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    responsible_name = serializers.SerializerMethodField()
    movement_type_display = serializers.CharField(
        source='get_movement_type_display',
        read_only=True
    )
    reason = serializers.SerializerMethodField()
    
    class Meta:
        model = StockMovement
        fields = [
            'id',
            'movement_type',
            'movement_type_display',
            'product_name',
            'product_sku',
            'quantity',
            'reason',
            'warehouse_from',
            'warehouse_to',
            'responsible_name',
            'reference',
            'created_at',
        ]
    
    def get_responsible_name(self, obj):
        if obj.responsible:
            return f"{obj.responsible.first_name} {obj.responsible.last_name}".strip() or obj.responsible.username
        return "N/A"
    
    def get_reason(self, obj):
        return obj.get_reason()
