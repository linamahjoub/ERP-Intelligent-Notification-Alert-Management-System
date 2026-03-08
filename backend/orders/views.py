from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q
from django.contrib.auth import get_user_model

from .models import Order, OrderItem
from notifications.models import Notification
from .serializers import (
    OrderDetailSerializer,
    OrderListSerializer,
    OrderCreateSerializer,
    OrderItemSerializer,
)


User = get_user_model()


class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les commandes"""
    
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['customer__username', 'customer__email', 'shipping_address']
    ordering_fields = ['created_at', 'status', 'total_amount']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Retourne les commandes selon le rôle de l'utilisateur"""
        user = self.request.user
        
        # Les admins voient toutes les commandes
        if user.is_staff or user.is_superuser:
            return Order.objects.select_related('customer').prefetch_related('items').all()
        
        # Les utilisateurs normaux voient uniquement leurs propres commandes
        return Order.objects.select_related('customer').prefetch_related('items').filter(customer=user)
    
    def get_serializer_class(self):
        """Utilise le bon sérialiseur selon l'action"""
        if self.action == 'list':
            return OrderListSerializer
        elif self.action == 'create':
            return OrderCreateSerializer
        return OrderDetailSerializer
    
    def create(self, request, *args, **kwargs):
        """Crée une nouvelle commande"""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()

        # Notifier le client et les administrateurs qu'une commande a ete creee.
        self._create_order_created_notifications(order)
        
        # Retourner la commande créée avec le sérialiseur détaillé
        return Response(
            OrderDetailSerializer(order).data,
            status=status.HTTP_201_CREATED
        )

    def _create_order_created_notifications(self, order):
        """Crée des notifications (in-app + email) lors de la création d'une commande."""
        customer_name = order.customer.get_full_name().strip() or order.customer.username
        order_total = f"{order.total_amount:.2f}"

        # Destinataires: client + tous les admins/staff (sans doublons).
        admin_users = User.objects.filter(Q(is_staff=True) | Q(is_superuser=True))
        recipients = {order.customer.id: order.customer}
        recipients.update({user.id: user for user in admin_users})

        for user in recipients.values():
            if user.id == order.customer.id:
                title = "Commande creee avec succes"
                message = (
                    f"Votre commande #{order.id} a ete creee avec succes. "
                    f"Montant total: {order_total}."
                )
            else:
                title = "Nouvelle commande creee"
                message = (
                    f"Une nouvelle commande #{order.id} a ete creee par {customer_name}. "
                    f"Montant total: {order_total}."
                )

            self._create_and_send_notification(
                user=user,
                title=title,
                message=message,
            )

    def _create_and_send_notification(self, user, title, message):
        """Crée une notification et tente l'envoi email (sans casser le flow API)."""
        notification = Notification.objects.create(
            user=user,
            title=title,
            message=message,
            notification_type='system',
        )

        # L'envoi email ne doit pas bloquer la réponse API en cas d'échec SMTP.
        try:
            notification.send_email_notification()
        except Exception:
            pass
    
    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        """Retourne les commandes de l'utilisateur connecté"""
        queryset = Order.objects.filter(customer=request.user).select_related('customer').prefetch_related('items')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Retourne les commandes en attente"""
        queryset = self.get_queryset().filter(status='pending')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """Filtrer par statut"""
        status_param = request.query_params.get('status')
        
        if not status_param:
            return Response(
                {'error': 'Le paramètre "status" est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        valid_statuses = [choice[0] for choice in Order.STATUS_CHOICES]
        if status_param not in valid_statuses:
            return Response(
                {'error': f'Statut invalide. Utilisez: {", ".join(valid_statuses)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(status=status_param)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Retourne les statistiques des commandes"""
        queryset = self.get_queryset()
        
        stats = {
            'total_orders': queryset.count(),
            'pending': queryset.filter(status='pending').count(),
            'confirmed': queryset.filter(status='confirmed').count(),
            'preparing': queryset.filter(status='preparing').count(),
            'shipped': queryset.filter(status='shipped').count(),
            'delivered': queryset.filter(status='delivered').count(),
            'returned': queryset.filter(status='returned').count(),
            'cancelled': queryset.filter(status='cancelled').count(),
            'total_value': sum(order.total_amount for order in queryset),
            'average_value': queryset.filter(total_amount__gt=0).values('total_amount').count(),
        }
        
        if stats['average_value'] > 0:
            stats['average_value'] = stats['total_value'] / stats['average_value']
        
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirmé une commande"""
        order = self.get_object()
        
        # Vérifier les permissions
        if not (request.user == order.customer or request.user.is_staff or request.user.is_superuser):
            return Response(
                {'error': 'Vous n\'avez pas la permission d\'effectuer cette action'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if order.status != 'pending':
            return Response(
                {'error': 'Seules les commandes en attente peuvent être confirmées'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = 'confirmed'
        order.confirmed_at = timezone.now()
        order.save()

        # Notifications (in-app + email) lors de la confirmation admin.
        self._notify_order_confirmed(order, request.user)
        
        return Response(OrderDetailSerializer(order).data)

    def _notify_order_confirmed(self, order, actor):
        """Notifier client et admins qu'une commande est confirmée."""
        customer_name = order.customer.get_full_name().strip() or order.customer.username

        # Client
        self._create_and_send_notification(
            user=order.customer,
            title="Commande confirmee",
            message=(
                f"Votre commande #{order.id} a ete confirmee par l'administration. "
                "Nous preparons votre expedition."
            ),
        )

        # Admins/staff (hors acteur pour eviter le doublon de notification sur soi)
        admin_users = User.objects.filter(Q(is_staff=True) | Q(is_superuser=True)).exclude(id=actor.id)
        for admin_user in admin_users:
            self._create_and_send_notification(
                user=admin_user,
                title="Commande confirmée par un administrateur",
                message=(
                    f"La commande #{order.id} de {customer_name} a ete confirmee par "
                    f"{actor.get_full_name().strip() or actor.username}."
                ),
            )
    
    @action(detail=True, methods=['post'])
    def prepare(self, request, pk=None):
        """Passe une commande en préparation"""
        order = self.get_object()
        
        # Seuls les admins peuvent passer en préparation
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {'error': 'Seuls les administrateurs peuvent effectuer cette action'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if order.status not in ['pending', 'confirmed']:
            return Response(
                {'error': 'Cette commande ne peut pas être mise en préparation'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = 'preparing'
        order.save()
        
        return Response(OrderDetailSerializer(order).data)
    
    @action(detail=True, methods=['post'])
    def ship(self, request, pk=None):
        """Marque une commande comme expédiée"""
        order = self.get_object()
        
        # Seuls les admins
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {'error': 'Seuls les administrateurs peuvent effectuer cette action'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if order.status != 'preparing':
            return Response(
                {'error': 'Cette commande ne peut pas être expédiée'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = 'shipped'
        order.shipped_at = timezone.now()
        order.save()
        
        return Response(OrderDetailSerializer(order).data)
    
    @action(detail=True, methods=['post'])
    def deliver(self, request, pk=None):
        """Marque une commande comme livrée"""
        order = self.get_object()
        
        if order.status != 'shipped':
            return Response(
                {'error': 'Cette commande ne peut pas être marquée comme livrée'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = 'delivered'
        order.delivered_at = timezone.now()
        order.save()
        
        return Response(OrderDetailSerializer(order).data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Annule une commande"""
        order = self.get_object()
        
        # Vérifier les permissions
        if not (request.user == order.customer or request.user.is_staff or request.user.is_superuser):
            return Response(
                {'error': 'Vous n\'avez pas la permission d\'effectuer cette action'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Ne peut annuler que les commandes non encore expédiées
        if order.status in ['shipped', 'delivered', 'returned']:
            return Response(
                {'error': 'Cette commande ne peut pas être annulée'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = 'cancelled'
        order.save()
        
        return Response(OrderDetailSerializer(order).data)
    
    @action(detail=True, methods=['post'])
    def return_order(self, request, pk=None):
        """Marque une commande comme retournée"""
        order = self.get_object()
        
        if order.status != 'delivered':
            return Response(
                {'error': 'Seules les commandes livrées peuvent être retournées'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = 'returned'
        order.save()
        
        return Response(OrderDetailSerializer(order).data)
