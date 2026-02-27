from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail, EmailMessage
from django.conf import settings
import logging
from .models import Alert
from .serializers import AlertSerializer
from activity.models import ActivityLog

# Configurer le logger
logger = logging.getLogger(__name__)


def normalize_channels(channels):
    if not channels:
        return []
    if isinstance(channels, list):
        return [str(c).strip().lower() for c in channels if str(c).strip()]
    return [str(channels).strip().lower()]


def send_alert_email(recipients, alert_name, module, severity, message=""):
    """
    Envoyer un email d'alerte à une liste de destinataires
    
    Args:
        recipients: liste d'emails ou adresse email unique
        alert_name: nom de l'alerte
        module: module concerné
        severity: niveau de gravité
        message: message personnalisé (optionnel)
    
    Returns:
        True si succès, False sinon
    """
    # Gérer le cas où recipients est une chaîne ou une liste
    if isinstance(recipients, str):
        email_list = [recipients]
    elif isinstance(recipients, list):
        email_list = [r.strip() for r in recipients if r and '@' in str(r)]
    else:
        logger.warning(f"Types de destinataires invalide: {type(recipients)}")
        return False
    
    if not email_list:
        logger.warning("Aucun email valide à envoyer")
        return False
    
    try:
        subject = f" Alerte: {alert_name}"
        
        severity_map = {
            'critical': ' CRITIQUE',
            'high': ' HAUTE',
            'medium': ' MOYENNE',
            'low': ' BASSE'
        }
        
        severity_label = severity_map.get(severity, severity)
        
        email_body = f"""

              ALERTE DÉCLENCHÉE               


Nom de l'alerte  : {alert_name}
Module           : {module}
Sévérité         : {severity_label}
Timestamp        : {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

{message}



 Connectez-vous à la plateforme pour voir les détails:
   {settings.FRONTEND_URL}

Merci,
L'équipe SmartNotify
"""
        
        # Envoyer l'email
        email = EmailMessage(
            subject=subject,
            body=email_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=email_list,
        )
        
        result = email.send(fail_silently=False)
        logger.info(f" Email d'alerte envoyé avec succès à {email_list}")
        return result > 0
        
    except Exception as e:
        logger.error(f" Erreur lors de l'envoi de l'email d'alerte: {str(e)}", exc_info=True)
        return False

class AlertViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les alertes"""
    serializer_class = AlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Retourner les alertes en fonction du rôle de l'utilisateur"""
        user = self.request.user
        
        # Les superusers/admins voient TOUTES les alertes
        if user.is_superuser or user.is_staff:
            return Alert.objects.all()
        
        # Les utilisateurs normaux ne voient que leurs propres alertes
        return Alert.objects.filter(user=user)
    
    def update(self, request, *args, **kwargs):
        """Log la mise à jour"""
        print(f"\n[VIEWSET UPDATE] Requête {request.method} pour alertes")
        print(f"[VIEWSET UPDATE] URL: {request.path}")
        print(f"[VIEWSET UPDATE] Utilisateur: {request.user}")
        return super().update(request, *args, **kwargs)
    
    def list(self, request, *args, **kwargs):
        """Retourner la liste des alertes"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        """Associer l'alerte à l'utilisateur actuel et envoyer un email de confirmation"""
        print("\n" + "="*80)
        print("[PERFORM_CREATE]  perform_create() a été appelé!")
        print("="*80)
        
        alert = serializer.save(user=self.request.user)
        channels = normalize_channels(alert.notification_channels)
        
        # Logger l'activité
        ActivityLog.objects.create(
            actor=self.request.user,
            action_type=ActivityLog.ACTION_ALERT_CREATED,
            title=f"Nouvelle alerte: {alert.name}",
            description=f"Sévérité: {alert.get_severity_display()} | Module: {alert.module}",
        )
        
        # Envoyer un email de confirmation au créateur
        try:
            user_email = self.request.user.email
            print(f"[ALERT CREATE] Email utilisateur: {user_email}")
            
            if not user_email:
                print(f"[ALERT CREATE] ⚠️ Email utilisateur VIDE! Impossible d'envoyer.")
                logger.warning(f"Email utilisateur vide pour {self.request.user.username}")
                return
            
            alert_name = alert.name
            module = alert.module
            severity = alert.severity
            
            subject = 'Alerte créée avec succès'
            message = f"""
Bonjour {self.request.user.username},

Votre alerte a été créée avec succès et est maintenant active!



Détails de votre alerte:
  ├─ Nom: {alert_name}
  ├─ Module: {module}
  ├─ Sévérité: {alert.get_severity_display()}
  ├─ Type: {alert.get_condition_type_display()}
  ├─ Statut: {' ACTIVE' if alert.is_active else ' INACTIVE'}
  └─ Canaux: {', '.join(alert.notification_channels) if alert.notification_channels else 'Aucun'}

Destinataires d'alerte: 
  {', '.join(alert.recipients) if alert.recipients else 'Aucun destinataire configuré'}



Vous et les destinataires recevrez des notifications selon la configuration.

 Connectez-vous pour gérer vos alertes: {settings.FRONTEND_URL}/alerts

Cordialement,
L'équipe SmartNotify
            """
            
            print(f"[ALERT CREATE] Envoi d'email à: {user_email}")
            result = send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user_email],
                fail_silently=False,
            )
            print(f"[ALERT CREATE] Résultat send_mail: {result}")
            
            if result > 0:
                print(f"[ALERT CREATE] ✅ Email envoyé avec succès à {user_email}")
                logger.info(f"✅ Email de confirmation d'alerte envoyé à {user_email}")
            else:
                print(f"[ALERT CREATE] ⚠️ send_mail a retourné {result}")
                logger.warning(f"⚠️ Email de création non envoyé à {user_email} (result={result})")
            
            # Envoyer un email aux destinataires spécifiés
            if alert.recipients and 'email' in channels:
                success = send_alert_email(
                    alert.recipients,
                    alert_name,
                    module,
                    severity,
                    f"Une nouvelle alerte a été configurée pour vous.\n\nDescription: {alert.description or 'Aucune'}\nThreshold: {alert.threshold_value or 'Non défini'}"
                )
                if success:
                    logger.info(f" Alerte envoyée à {len(alert.recipients)} destinataire(s)")
            
        except Exception as e:
            # Log l'erreur mais ne pas empêcher la création de l'alerte
            print(f"[ALERT CREATE] ❌ ERREUR: {type(e).__name__}: {str(e)}")
            logger.error(f"❌ Erreur lors de l'envoi de l'email de création: {str(e)}", exc_info=True)
    
    def perform_update(self, serializer):
        """Vérifier que l'utilisateur ne peut modifier que ses propres alertes et envoyer une notification"""
        from rest_framework.exceptions import PermissionDenied
        
        print("\n" + "="*80)
        print("[PERFORM_UPDATE] ✅ perform_update() a été appelé!")
        print("="*80)
        
        alert = self.get_object()
        if alert.user != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied("Vous n'avez pas la permission de modifier cette alerte")
        
        # Sauvegarder les modifications
        alert_updated = serializer.save()
        print(f"\n[ALERT UPDATE] Alerte mise à jour: {alert_updated.name}")
        
        # Envoyer une notification de modification
        user_email = self.request.user.email
        print(f"[ALERT UPDATE] Email utilisateur: {user_email}")
        
        if not user_email:
            print(f"[ALERT UPDATE]  Email utilisateur vide! Impossible d'envoyer.")
            logger.warning(f"Email utilisateur vide pour {self.request.user.username}")
            return
        
        try:
            alert_name = alert_updated.name
            module = alert_updated.module
            
            subject = 'Alerte modifiée avec succès'
            message = f"""
Bonjour {self.request.user.username},

Votre alerte a été modifiée avec succès!

Détails de votre alerte:
  ├─ Nom: {alert_name}
  ├─ Module: {module}
  ├─ Sévérité: {alert_updated.get_severity_display()}
  ├─ Type: {alert_updated.get_condition_type_display()}
  ├─ Statut: {'ACTIVE' if alert_updated.is_active else 'INACTIVE'}
  └─ Canaux: {', '.join(alert_updated.notification_channels) if alert_updated.notification_channels else 'Aucun'}

Destinataires d'alerte: 
  {', '.join(alert_updated.recipients) if alert_updated.recipients else 'Aucun destinataire configuré'}

Vous et les destinataires recevrez des notifications selon la configuration actuelle.

Connectez-vous pour gérer vos alertes: {settings.FRONTEND_URL}/alerts

Cordialement,
L'équipe SmartNotify
            """
            
            print(f"[ALERT UPDATE] Envoi d'email à: {user_email}")
            result = send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user_email],
                fail_silently=False,
            )
            print(f"[ALERT UPDATE] Résultat send_mail: {result}")
            
            if result > 0:
                print(f"[ALERT UPDATE] ✅ Email envoyé avec succès à {user_email}")
                logger.info(f"✅ Email de modification d'alerte envoyé avec succès à {user_email}")
            else:
                print(f"[ALERT UPDATE] ⚠️ send_mail a retourné {result}")
                logger.warning(f"⚠️ Email de modification non envoyé à {user_email} (result={result})")
            
        except Exception as e:
            print(f"[ALERT UPDATE] ❌ ERREUR: {type(e).__name__}: {str(e)}")
            logger.error(f"❌ Erreur lors de l'envoi de l'email de modification: {str(e)}", exc_info=True)
    
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
    
    @action(detail=True, methods=['post'])
    def send_alert(self, request, pk=None):
        """Envoyer l'alerte aux destinataires spécifiés"""
        alert = self.get_object()
        
        if alert.user != request.user and not request.user.is_staff:
            logger.warning(f"Tentative non autorisée d'envoi d'alerte par {request.user.email}")
            return Response(
                {'error': 'Vous n\'avez pas la permission d\'envoyer cette alerte'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not alert.recipients:
            return Response(
                {'error': 'Aucun destinataire défini pour cette alerte'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        channels = normalize_channels(alert.notification_channels)
        if not channels:
            return Response(
                {'error': 'Aucun canal de notification défini pour cette alerte'},
                status=status.HTTP_400_BAD_REQUEST
            )

        message = f"Description: {alert.description or 'Aucune'}\n\nCondition: {alert.threshold_value or 'Non défini'}"

        email_success = False

        if 'email' in channels:
            email_success = send_alert_email(
                alert.recipients,
                alert.name,
                alert.module,
                alert.severity,
                message
            )

        if email_success:
            logger.info(f" Alerte {alert.id} envoyée à {len(alert.recipients)} destinataire(s)")
            return Response({
                'message': f'Alerte envoyée avec succès à {len(alert.recipients)} destinataire(s)',
                'recipients': alert.recipients,
                'channels': channels
            })

        logger.error(f" Échec d'envoi de l'alerte {alert.id}")
        return Response(
            {'error': 'Erreur lors de l\'envoi de l\'alerte'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
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
