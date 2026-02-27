from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from activity.models import ActivityLog
from .models import Product
from .serializers import ProductSerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        product = serializer.save()

        ActivityLog.objects.create(
            actor=self.request.user,
            action_type=ActivityLog.ACTION_PRODUCT_CREATED,
            title=f"Nouveau produit: {product.name}",
            description=f"SKU: {product.sku} | Quantite: {product.quantity}",
        )
