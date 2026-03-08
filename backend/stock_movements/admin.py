from django.contrib import admin
from .models import StockMovement


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'movement_type',
        'product',
        'quantity',
        'get_reason',
        'responsible',
        'created_at',
    )
    list_filter = (
        'movement_type',
        'created_at',
        'responsible',
        'entry_reason',
        'exit_reason',
    )
    search_fields = (
        'product__name',
        'product__sku',
        'reference',
        'notes',
        'responsible__username',
    )
    readonly_fields = (
        'created_at',
        'updated_at',
    )
    fieldsets = (
        ('Informations du Mouvement', {
            'fields': (
                'movement_type',
                'product',
                'quantity',
                'reference',
            )
        }),
        ('Raison du Mouvement', {
            'fields': (
                'entry_reason',
                'exit_reason',
            )
        }),
        ('Transfert d\'Entrepôt', {
            'fields': (
                'warehouse_from',
                'warehouse_to',
            ),
            'classes': ('collapse',)
        }),
        ('Responsabilité', {
            'fields': (
                'responsible',
            )
        }),
        ('Détails', {
            'fields': (
                'notes',
            )
        }),
        ('Audit', {
            'fields': (
                'created_at',
                'updated_at',
            ),
            'classes': ('collapse',)
        }),
    )
    
    def get_reason(self, obj):
        return obj.get_reason()
    get_reason.short_description = 'Raison'
