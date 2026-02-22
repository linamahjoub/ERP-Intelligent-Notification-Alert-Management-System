from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "sku", "category", "status", "quantity", "price", "supplier")
    search_fields = ("name", "sku", "category", "supplier")
    list_filter = ("category", "status")
