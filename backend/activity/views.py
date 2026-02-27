from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import ActivityLog
from .serializers import ActivityLogSerializer


class RecentActivityListView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not (user.is_superuser or user.is_staff or getattr(user, "is_primary_admin", False)):
            raise PermissionDenied("Acces reserve aux administrateurs")

        # Filtrer les activités de l'utilisateur connecté uniquement
        queryset = ActivityLog.objects.filter(actor=user).select_related("actor").order_by("-created_at")
        
        limit_param = self.request.query_params.get("limit")
        try:
            limit = int(limit_param) if limit_param else 6
        except (TypeError, ValueError):
            limit = 6

        if limit > 0:
            return queryset[:limit]
        return queryset
