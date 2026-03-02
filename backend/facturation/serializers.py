from rest_framework import serializers
from .models import Invoice, InvoiceItem, Payment
from stock.models import Product
from fournisseur.models import Supplier


class InvoiceItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = InvoiceItem
        fields = ['id', 'invoice', 'product', 'product_name', 'description', 'quantity', 'unit_price', 'total_price']
        read_only_fields = ['total_price']


class PaymentSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'invoice', 'payment_date', 'amount', 'payment_method', 'reference', 'notes', 'created_by', 'created_by_name', 'created_at']
        read_only_fields = ['created_by', 'created_at']


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    balance_due = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'invoice_type', 'customer_name', 'customer_email',
            'customer_phone', 'customer_address', 'supplier', 'supplier_name',
            'invoice_date', 'due_date', 'subtotal', 'tax_rate', 'tax_amount',
            'discount', 'total_amount', 'amount_paid', 'balance_due', 'status',
            'is_overdue', 'notes', 'terms', 'items', 'payments',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['tax_amount', 'total_amount', 'created_by', 'created_at', 'updated_at']


class InvoiceCreateSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, required=False)
    
    class Meta:
        model = Invoice
        fields = [
            'invoice_number', 'invoice_type', 'customer_name', 'customer_email',
            'customer_phone', 'customer_address', 'supplier', 'invoice_date',
            'due_date', 'subtotal', 'tax_rate', 'discount', 'status',
            'notes', 'terms', 'items'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        invoice = Invoice.objects.create(**validated_data)
        
        for item_data in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item_data)
        
        return invoice

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if items_data is not None:
            # Delete existing items and create new ones
            instance.items.all().delete()
            for item_data in items_data:
                InvoiceItem.objects.create(invoice=instance, **item_data)
        
        return instance
