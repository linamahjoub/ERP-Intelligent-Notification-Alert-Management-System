from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Supplier
from .serializers import SupplierSerializer
from activity.models import ActivityLog


class SupplierViewSet(viewsets.ModelViewSet):
	queryset = Supplier.objects.all()
	serializer_class = SupplierSerializer
	permission_classes = [IsAuthenticated]

	def perform_create(self, serializer):
		"""Créer un fournisseur et logger l'activité"""
		supplier = serializer.save()
		# Logger l'activité
		ActivityLog.objects.create(
			actor=self.request.user,
			action_type=ActivityLog.ACTION_PRODUCT_CREATED,
			title=f"Nouveau fournisseur: {supplier.name}",
			description=f"Fournisseur créé avec succès",
		)
