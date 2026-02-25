from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Notification
from .serializers import NotificationSerializer, CreateNotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les notifications"""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Retourner les notifications de l'utilisateur connecté"""
        user = self.request.user
        
        # Si l'utilisateur est superuser, afficher toutes les notifications
        if user.is_superuser:
            return Notification.objects.all()
        
        # Sinon, afficher seulement les notifications de l'utilisateur
        return Notification.objects.filter(user=user)
    
    def get_serializer_class(self):
        """Utiliser le bon serializer selon l'action"""
        if self.action == 'create':
            return CreateNotificationSerializer
        return NotificationSerializer
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Marquer une notification comme lue"""
        notification = self.get_object()
        notification.mark_as_read()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_as_unread(self, request, pk=None):
        """Marquer une notification comme non lue"""
        notification = self.get_object()
        notification.mark_as_unread()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Marquer toutes les notifications comme lues"""
        notifications = self.get_queryset().filter(is_read=False)
        count = 0
        for notification in notifications:
            if notification.mark_as_read():
                count += 1
        return Response({
            'message': f'{count} notification(s) marquée(s) comme lue(s)',
            'count': count
        })
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Obtenir le nombre de notifications non lues"""
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'unread_count': count})
    
    @action(detail=False, methods=['post'])
    def delete_old(self, request):
        """Supprimer les notifications lues de plus de 30 jours"""
        from datetime import timedelta
        threshold_date = timezone.now() - timedelta(days=30)
        deleted_count, _ = self.get_queryset().filter(
            is_read=True,
            read_at__lt=threshold_date
        ).delete()
        return Response({
            'message': f'{deleted_count} notification(s) supprimée(s)',
            'count': deleted_count
        })
