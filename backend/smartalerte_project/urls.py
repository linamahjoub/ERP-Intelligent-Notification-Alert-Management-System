from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    # Expose the same account admin endpoints under /api/admin/ for the frontend admin panel
    path('api/admin/', include('accounts.urls')),
    path('api/alerts/', include('alerts.urls')),
    path('api/stock/', include('stock.urls')),
    path('api/fournisseurs/', include('fournisseur.urls')),
    path('api/categories/', include('categories.urls')),
    path('api/', include('notifications.urls')),
]

# Servir les fichiers media en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)