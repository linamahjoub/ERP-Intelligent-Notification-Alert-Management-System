from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings
from .models import Alert
from .serializers import AlertSerializer

class AlertViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les alertes"""
    serializer_class = AlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Retourner uniquement les alertes de l'utilisateur connecté"""
        user = self.request.user
        # Tous les utilisateurs (admin ou non) ne voient que leurs propres alertes
        return Alert.objects.filter(user=user)
    
    def list(self, request, *args, **kwargs):
        """Retourner la liste des alertes"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        """Associer l'alerte à l'utilisateur actuel et envoyer un email de confirmation"""
        alert = serializer.save(user=self.request.user)
        
        # Envoyer un email de confirmation
        try:
            user_email = self.request.user.email
            alert_name = alert.name
            module_name = alert.module
            
            subject = ' Alerte créée avec succès'
            message = f"""
Bonjour {self.request.user.username},

Votre alerte a été créée avec succès !

Détails de l'alerte :
- Nom : {alert_name}
- Module : {module_name}
- Type de condition : {alert.get_condition_type_display()}
- Niveau de sévérité : {alert.get_severity_display()}
- Statut : {'Active' if alert.is_active else 'Inactive'}

Vous recevrez des notifications selon la configuration de votre alerte.

Cordialement,
L'équipe SmartNotify
            """
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user_email],
                fail_silently=True,  
            )
        except Exception as e:
            # Log l'erreur mais ne pas empêcher la création de l'alerte
            print(f"Erreur lors de l'envoi de l'email : {str(e)}")
    
    def perform_update(self, serializer):
        """Vérifier que l'utilisateur ne peut modifier que ses propres alertes"""
        alert = self.get_object()
        if alert.user != self.request.user and not self.request.user.is_staff:
            return Response(
                {'error': 'Vous n\'avez pas la permission de modifier cette alerte'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save()
    
    def perform_destroy(self, instance):
        """Vérifier que l'utilisateur ne peut supprimer que ses propres alertes"""
        if instance.user != self.request.user and not self.request.user.is_staff:
            return Response(
                {'error': 'Vous n\'avez pas la permission de supprimer cette alerte'},
                status=status.HTTP_403_FORBIDDEN
            )
        instance.delete()
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Activer/Désactiver une alerte"""
        alert = self.get_object()
        
        if alert.user != request.user and not request.user.is_staff:
            return Response(
                {'error': 'Vous n\'avez pas la permission de modifier cette alerte'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        alert.is_active = not alert.is_active
        alert.save()
        
        return Response({
            'message': f'Alerte {"activée" if alert.is_active else "désactivée"}',
            'alert': AlertSerializer(alert).data
        })
    
    @action(detail=False, methods=['get'])
    def my_alerts(self, request):
        """Récupérer les alertes de l'utilisateur connecté"""
        alerts = Alert.objects.filter(user=request.user)
        serializer = self.get_serializer(alerts, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_module(self, request):
        """Récupérer les alertes groupées par module"""
        module = request.query_params.get('module')
        
        queryset = self.get_queryset()
        if module:
            queryset = queryset.filter(module=module)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_severity(self, request):
        """Récupérer les alertes groupées par sévérité"""
        severity = request.query_params.get('severity')
        
        queryset = self.get_queryset()
        if severity:
            queryset = queryset.filter(severity=severity)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active_only(self, request):
        """Récupérer uniquement les alertes actives"""
        queryset = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
