from django.contrib import admin

from .models import ProductionOrder, ProductionOrderMaterial, RawMaterial, ProductionAlert


@admin.register(RawMaterial)
class RawMaterialAdmin(admin.ModelAdmin):
    list_display = ("name", "unit", "available_stock", "reorder_level", "is_active", "updated_at")
    search_fields = ("name",)
    list_filter = ("is_active",)


class ProductionOrderMaterialInline(admin.TabularInline):
    model = ProductionOrderMaterial
    extra = 0


@admin.register(ProductionOrder)
class ProductionOrderAdmin(admin.ModelAdmin):
    list_display = ("code", "product", "status", "planned_quantity", "produced_quantity", "start_date", "due_date")
    search_fields = ("code", "product__name", "product__sku")
    list_filter = ("status", "start_date", "due_date")
    inlines = [ProductionOrderMaterialInline]


@admin.register(ProductionAlert)
class ProductionAlertAdmin(admin.ModelAdmin):
    list_display = ("order", "alert_type", "severity", "is_resolved", "created_at")
    search_fields = ("order__code", "message")
    list_filter = ("alert_type", "severity", "is_resolved")
