from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ProductionAlertViewSet, ProductionOrderViewSet, RawMaterialViewSet

router = DefaultRouter()
router.register(r"orders", ProductionOrderViewSet, basename="production-order")
router.register(r"raw-materials", RawMaterialViewSet, basename="raw-material")
router.register(r"alerts", ProductionAlertViewSet, basename="production-alert")

urlpatterns = [
    path("", include(router.urls)),
]
