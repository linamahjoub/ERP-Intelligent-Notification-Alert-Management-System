from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.db.models import Q
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils import timezone
import requests
import json
import base64

from activity.models import ActivityLog

from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    UserUpdateSerializer, AdminUserCreateSerializer,
    AdminUserUpdateSerializer, ChangePasswordSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer
)

User = get_user_model()


# ==================== FONCTIONS UTILITAIRES ====================

def send_welcome_email(user):
    """
    Envoie un email de bienvenue après inscription
    """
    subject = 'Bienvenue sur SmartNotify - Inscription réussie'
    
    message = f"""
    Bonjour {user.username},
    
    Merci de vous être inscrit sur SmartNotify !
    
    Votre compte est maintenant en attente de validation par notre équipe administrative.
    Vous recevrez un email dès que votre compte sera activé.
    
    Voici un récapitulatif de vos informations :
    - Email : {user.email}
    - Nom d'utilisateur : {user.username}
    
    Cordialement,
    L'équipe SmartNotify
    """
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        print(f" Email de bienvenue envoyé à {user.email}")
        return True
    except Exception as e:
        print(f" Erreur: {e}")
        return False

def send_account_approved_email(user):
    """
    Envoie un email lorsque le compte est approuvé par l'admin
    """
    subject = ' Votre compte SmartNotify a été activé'
    
    message = f"""
Bonjour {user.username},

Bonne nouvelle ! Votre compte SmartNotify a été approuvé par notre équipe administrative.

Vous pouvez maintenant vous connecter et commencer à créer vos alertes personnalisées.

🔗 Connexion : {settings.FRONTEND_URL}/login
📧 Email : {user.email}

Nous sommes ravis de vous accueillir parmi nos utilisateurs !

Cordialement,
L'équipe SmartNotify
"""
    
    try:
        print(f" Tentative d'envoi d'email d'activation à {user.email}...")
        result = send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        print(f" Email d'activation envoyé avec succès à {user.email} (résultat: {result})")
        return True
        
    except Exception as e:
        print(f" ERREUR lors de l'envoi de l'email d'activation: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def send_account_rejected_email(user):
    """
    Envoie un email lorsque le compte est rejeté par l'admin
    """
    print(f"\n DÉBUT ENVOI EMAIL DE REJET")
    print(f" Utilisateur: {user.username} ({user.email})")
    
    subject = '📧 Statut de votre compte SmartNotify - Demande non retenue'
    
    # Message en texte brut (toujours nécessaire)
    plain_message = f"""
Bonjour {user.username},

Nous avons bien reçu votre demande d'inscription sur SmartNotify.

Malheureusement, après vérification par notre équipe administrative, nous ne pouvons pas valider votre compte à ce stade.

 Raisons possibles :
- Informations incomplètes ou incorrectes
- Email non valide
- Vous ne répondez pas aux critères requis

 Que faire maintenant ?
Vous pouvez :
1. Vérifier vos informations et réessayer de vous inscrire
2. Contacter notre support pour plus d'informations : support@smartnotify.com

Nous restons à votre disposition pour toute question.

Cordialement,
L'équipe SmartNotify
"""
    
    try:
        # Vérifier la configuration email
        print(f" Configuration email:")
        print(f"   - EMAIL_HOST: {getattr(settings, 'EMAIL_HOST', 'Non défini')}")
        print(f"   - EMAIL_PORT: {getattr(settings, 'EMAIL_PORT', 'Non défini')}")
        print(f"   - EMAIL_USE_TLS: {getattr(settings, 'EMAIL_USE_TLS', 'Non défini')}")
        print(f"   - DEFAULT_FROM_EMAIL: {getattr(settings, 'DEFAULT_FROM_EMAIL', 'Non défini')}")
        
        # Vérifier que l'email de l'utilisateur est valide
        if not user.email or '@' not in user.email:
            print(f" Email utilisateur invalide: {user.email}")
            return False
        
        print(f" Tentative d'envoi d'email à {user.email}...")
        
        # Envoyer l'email
        result = send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,  # Mettre à False pour voir les erreurs
        )
        
        print(f" Résultat send_mail: {result}")
        
        if result == 1:  # send_mail retourne le nombre d'emails envoyés avec succès
            print(f" Email de rejet envoyé avec SUCCÈS à {user.email}")
            return True
        else:
            print(f" Échec de l'envoi - résultat: {result}")
            return False
        
    except Exception as e:
        print(f" ERREUR lors de l'envoi de l'email de rejet: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


# ==================== AUTHENTIFICATION ====================

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Inscription d'un nouvel utilisateur"""
    serializer = RegisterSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        
        # Désactiver le compte jusqu'à validation admin
        user.is_active = False
        user.save()
        
        # Envoyer l'email de bienvenue
        email_sent = send_welcome_email(user)
        
        # Générer les tokens JWT
        refresh = RefreshToken.for_user(user)
        
        response_data = {
            'message': 'Inscription réussie. Votre compte est en attente de validation.',
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'email_sent': email_sent
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Connexion d'un utilisateur"""
    serializer = LoginSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    email = serializer.validated_data['email']
    password = serializer.validated_data['password']
    
    # Chercher l'utilisateur par email
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({
            'error': 'Email ou mot de passe incorrect'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    # Vérifier le mot de passe (même pour les utilisateurs inactifs)
    if not user.check_password(password):
        return Response({
            'error': 'Email ou mot de passe incorrect'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    # L'utilisateur peut se connecter même s'il est inactif
    # Le frontend affichera une page "En attente d'approbation"
    
    # Créer une session Django pour tracker l'utilisateur en ligne
    # Spécifier le backend explicitement car nous avons plusieurs backends configurés
    login(request, user, backend='accounts.authentication.EmailBackend')
    
    # Générer les tokens JWT
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'message': 'Connexion réussie',
        'user': UserSerializer(user).data,
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Déconnexion d'un utilisateur"""
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        # Nettoyer la session Django
        logout(request)
        
        return Response({
            'message': 'Déconnexion réussie'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': 'Erreur lors de la déconnexion'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
    """Voir et modifier le profil de l'utilisateur connecté"""
    user = request.user
    
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        serializer = UserUpdateSerializer(
            user,
            data=request.data,
            partial=(request.method == 'PATCH'),
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Profil mis à jour avec succès',
                'user': UserSerializer(user).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """Changer le mot de passe de l'utilisateur connecté"""
    serializer = ChangePasswordSerializer(
        data=request.data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'message': 'Mot de passe changé avec succès'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request_view(request):
    """Demander un lien de réinitialisation du mot de passe"""
    serializer = PasswordResetRequestSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data['email']
    user = User.objects.filter(email=email).first()

    if user:
        token_generator = PasswordResetTokenGenerator()
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = token_generator.make_token(user)

        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3004')
        reset_link = f"{frontend_url}/reset-password/{uid}/{token}"

        send_mail(
            subject='Réinitialisation du mot de passe',
            message=(
                "Bonjour,\n\n"
                "Vous avez demandé la réinitialisation de votre mot de passe.\n"
                f"Cliquez sur ce lien pour définir un nouveau mot de passe :\n{reset_link}\n\n"
                "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email."
            ),
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@example.com'),
            recipient_list=[email],
            fail_silently=False,
        )

    return Response({
        'message': 'Si cet email existe, un lien de réinitialisation a été envoyé.'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm_view(request):
    """Confirmer la réinitialisation du mot de passe"""
    serializer = PasswordResetConfirmSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    uid = serializer.validated_data['uid']
    token = serializer.validated_data['token']
    new_password = serializer.validated_data['new_password']

    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
    except (User.DoesNotExist, ValueError, TypeError):
        return Response({'error': 'Lien de réinitialisation invalide.'}, status=status.HTTP_400_BAD_REQUEST)

    token_generator = PasswordResetTokenGenerator()
    if not token_generator.check_token(user, token):
        return Response({'error': 'Lien de réinitialisation invalide ou expiré.'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()

    return Response({'message': 'Mot de passe réinitialisé avec succès.'}, status=status.HTTP_200_OK)


# ==================== ADMIN - GESTION UTILISATEURS ====================

class IsAdminOrReadOnly(permissions.BasePermission):
    """Permission personnalisée pour les admins"""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and (
            request.user.is_superuser or 
            request.user.is_staff or 
            request.user.is_primary_admin
        )


class UserListCreateView(generics.ListCreateAPIView):
    """
    GET: Liste tous les utilisateurs (Admin uniquement)
    POST: Créer un nouvel utilisateur (Admin uniquement)
    """
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AdminUserCreateSerializer
        return UserSerializer
    
    def get_queryset(self):
        queryset = User.objects.all()
        
        # Filtres optionnels
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(email__icontains=search) |
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        role = self.request.query_params.get('role', None)
        if role == 'admin':
            queryset = queryset.filter(
                Q(is_superuser=True) | Q(is_staff=True) | Q(is_primary_admin=True)
            )
        elif role == 'user':
            queryset = queryset.filter(
                is_superuser=False, is_staff=False, is_primary_admin=False
            )
        
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset.order_by('-date_joined')
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        ActivityLog.objects.create(
            actor=request.user,
            action_type=ActivityLog.ACTION_USER_CREATED,
            title=f"Nouvel utilisateur: {user.username}",
            description=f"Email: {user.email}",
        )
        
        return Response({
            'message': 'Utilisateur créé avec succès',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Détails d'un utilisateur
    PUT/PATCH: Modifier un utilisateur (Admin uniquement)
    DELETE: Supprimer un utilisateur (Admin uniquement)
    """
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            # Si admin modifie, utiliser AdminUserUpdateSerializer
            if self.request.user.is_superuser or self.request.user.is_staff:
                return AdminUserUpdateSerializer
            return UserUpdateSerializer
        return UserSerializer
    
    def get_permissions(self):
        # Tout le monde peut voir, seuls les admins peuvent modifier/supprimer
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'message': 'Utilisateur mis à jour avec succès',
            'user': UserSerializer(instance).data
        })
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Empêcher la suppression de son propre compte
        if instance == request.user:
            return Response({
                'error': 'Vous ne pouvez pas supprimer votre propre compte'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Empêcher la suppression du dernier superuser
        if instance.is_superuser:
            superuser_count = User.objects.filter(is_superuser=True).count()
            if superuser_count <= 1:
                return Response({
                    'error': 'Impossible de supprimer le dernier superutilisateur'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        self.perform_destroy(instance)
        return Response({
            'message': 'Utilisateur supprimé avec succès'
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def user_stats_view(request):
    """Statistiques des utilisateurs (Admin uniquement)"""
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    admin_users = User.objects.filter(
        Q(is_superuser=True) | Q(is_staff=True) | Q(is_primary_admin=True)
    ).count()
    regular_users = total_users - admin_users
    
    return Response({
        'total_users': total_users,
        'active_users': active_users,
        'inactive_users': total_users - active_users,
        'admin_users': admin_users,
        'regular_users': regular_users,
    })


# ==================== UTILITAIRES ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def check_email_exists(request):
    """Vérifier si un email existe déjà"""
    email = request.query_params.get('email', '')
    exists = User.objects.filter(email=email).exists()
    
    return Response({
        'exists': exists,
        'valid': '@' in email and '.' in email
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resend_welcome_email_view(request):
    """Renvoyer l'email de bienvenue"""
    user = request.user
    
    email_sent = send_welcome_email(user)
    
    if email_sent:
        return Response({
            'message': 'Email renvoyé avec succès'
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'error': "Erreur lors de l'envoi de l'email"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== APPROBATION/REJET D'UTILISATEURS ====================

@api_view(['PATCH', 'POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def approve_user_view(request, pk):
    """Approuver un utilisateur (activer son compte)"""
    print(f"\n APPROBATION UTILISATEUR ID={pk}")
    try:
        # Récupérer l'utilisateur
        user = User.objects.get(pk=pk)
        print(f" Utilisateur trouvé: {user.username} ({user.email})")
        
        # Vérifier que l'utilisateur n'est pas un admin
        if user.is_superuser or user.is_staff or user.is_primary_admin:
            return Response({
                'error': 'Impossible d\'approuver un administrateur'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Activer l'utilisateur
        print(f" Activation du compte...")
        user.is_active = True
        user.save()
        print(f" Compte activé (is_active={user.is_active})")
        
        # Envoyer l'email de confirmation
        print(f" Envoi de l'email de confirmation...")
        email_sent = send_account_approved_email(user)
        print(f" Résultat envoi email: {email_sent}")
        
        return Response({
            'message': f'Utilisateur {user.username} approuvé avec succès',
            'user': UserSerializer(user).data,
            'email_sent': email_sent
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({
            'error': 'Utilisateur non trouvé'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f" Erreur lors de l'approbation: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'error': f'Erreur lors de l\'approbation: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH', 'POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def reject_user_view(request, pk):
    """Rejeter un utilisateur et lui envoyer un email de notification"""
    print(f"\n{'='*50}")
    print(f" REJET UTILISATEUR - Début du processus")
    print(f" ID Utilisateur: {pk}")
    print(f" Admin: {request.user.username} ({request.user.email})")
    print(f"{'='*50}")
    
    try:
        # Récupérer l'utilisateur
        user = User.objects.get(pk=pk)
        print(f" Utilisateur trouvé:")
        print(f"   - Username: {user.username}")
        print(f"   - Email: {user.email}")
        print(f"   - Actif: {user.is_active}")
        print(f"   - Admin: {user.is_superuser or user.is_staff or user.is_primary_admin}")
        
        # Vérifier que l'utilisateur n'est pas un admin
        if user.is_superuser or user.is_staff or user.is_primary_admin:
            print(f" Tentative de rejet d'un administrateur - Bloqué")
            return Response({
                'error': 'Impossible de rejeter un administrateur'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Envoyer l'email de rejet avant la suppression
        print(f"\n ÉTAPE 1: Envoi de l'email de rejet...")
        email_sent = send_account_rejected_email(user)
        
        print(f"\n ÉTAPE 2: Résultat de l'envoi d'email: {' SUCCÈS' if email_sent else '❌ ÉCHEC'}")
        
        # Stocker les informations pour la réponse
        username = user.username
        email = user.email
        
        # Attendre un peu pour s'assurer que l'email est parti (optionnel)
        import time
        time.sleep(1)
        
        # Supprimer l'utilisateur
        print(f"\n ÉTAPE 3: Suppression de l'utilisateur {username}...")
        user.delete()
        print(f" Utilisateur supprimé avec succès")
        
        # Réponse
        response_data = {
            'message': f'Utilisateur {username} rejeté avec succès',
            'email_sent': email_sent,
            'email': email
        }
        
        if not email_sent:
            response_data['warning'] = "L'utilisateur a été supprimé mais l'email de notification n'a pas pu être envoyé."
            response_data['debug_info'] = "Vérifiez la configuration email dans les logs du serveur"
        
        print(f"\n{'='*50}")
        print(f" PROCESSUS TERMINÉ - Réponse:")
        print(f"   - Email envoyé: {email_sent}")
        print(f"   - Destinataire: {email}")
        print(f"{'='*50}")
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        print(f" ERREUR: Utilisateur {pk} non trouvé")
        return Response({
            'error': 'Utilisateur non trouvé'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f" ERREUR lors du rejet: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'error': f'Erreur lors du rejet: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def online_users(request):
    """
    Retourne la liste des utilisateurs connectés (avec session active)
    Accessible uniquement aux admins
    """
    from django.contrib.sessions.models import Session
    from django.utils import timezone
    from datetime import timedelta
    
    try:
        # Récupérer toutes les sessions actives
        active_sessions = Session.objects.filter(expire_date__gte=timezone.now())
        
        # Extraire les user_id des sessions actives
        online_user_ids = []
        for session in active_sessions:
            try:
                session_data = session.get_decoded()
                user_id = session_data.get('_auth_user_id')
                if user_id:
                    online_user_ids.append(int(user_id))
            except:
                continue
        
        # Récupérer les utilisateurs correspondants
        online_users_list = User.objects.filter(
            id__in=online_user_ids,
            is_active=True
        ).order_by('-last_login')
        
        # Sérialiser les données
        users_data = []
        for user in online_users_list:
            users_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'last_login': user.last_login.isoformat() if user.last_login else None,
            })
        
        return Response({
            'count': len(users_data),
            'users': users_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Erreur lors de la récupération des utilisateurs en ligne: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== AUTHENTIFICATION GOOGLE OAUTH 2.0 ====================

@api_view(['POST'])
@permission_classes([AllowAny])
def google_oauth_callback_view(request):
    """
    Callback Google OAuth 2.0
    Reçoit le code d'authentification et l'échange contre un token
    """
    try:
        code = request.data.get('code')
        redirect_uri = request.data.get('redirect_uri')
        
        if not code:
            return Response({
                'error': 'Code d\'authentification manquant'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier si c'est un code de développement
        if code == 'dev-auth-code':
            # Mode développement - utiliser l'email fourni
            email = request.data.get('email')
            if not email:
                return Response({
                    'error': 'Email manquant en mode développement'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            return _handle_google_user_auth(
                email=email,
                first_name=request.data.get('first_name', ''),
                last_name=request.data.get('last_name', ''),
                is_dev_mode=True
            )
        
        # Mode production - Échanger le code contre un token Google
        import requests
        from django.conf import settings
        
        google_client_id = getattr(settings, 'GOOGLE_OAUTH_CLIENT_ID', '')
        google_client_secret = getattr(settings, 'GOOGLE_OAUTH_CLIENT_SECRET', '')
        
        if not google_client_id or not google_client_secret:
            return Response({
                'error': 'Google OAuth n\'est pas configuré'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Échanger le code contre un token
        token_response = requests.post(
            'https://oauth2.googleapis.com/token',
            data={
                'code': code,
                'client_id': google_client_id,
                'client_secret': google_client_secret,
                'redirect_uri': redirect_uri,
                'grant_type': 'authorization_code',
            },
            timeout=10
        )
        
        if token_response.status_code != 200:
            print(f"Erreur échange code Google: {token_response.text}")
            return Response({
                'error': 'Erreur lors de l\'échange du code'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        token_data = token_response.json()
        access_token = token_data.get('access_token')
        id_token = token_data.get('id_token')
        
        # Récupérer les infos utilisateur depuis l'ID token
        if id_token:
            import json
            import base64
            
            try:
                # Décoder le JWT (ignorer la signature pour dev)
                parts = id_token.split('.')
                if len(parts) == 3:
                    payload = parts[1]
                    padding = 4 - (len(payload) % 4)
                    if padding != 4:
                        payload += '=' * padding
                    
                    userinfo = json.loads(base64.urlsafe_b64decode(payload))
                else:
                    raise ValueError("Format JWT invalide")
            except Exception as e:
                print(f"Erreur décodage JWT: {e}")
                # Fallback: récupérer les infos via l'API userinfo
                userinfo_response = requests.get(
                    'https://www.googleapis.com/oauth2/v2/userinfo',
                    headers={'Authorization': f'Bearer {access_token}'},
                    timeout=10
                )
                userinfo = userinfo_response.json()
        else:
            # Récupérer les infos via l'API userinfo
            userinfo_response = requests.get(
                'https://www.googleapis.com/oauth2/v2/userinfo',
                headers={'Authorization': f'Bearer {access_token}'},
                timeout=10
            )
            userinfo = userinfo_response.json()
        
        email = userinfo.get('email')
        first_name = userinfo.get('given_name', '')
        last_name = userinfo.get('family_name', '')
        
        return _handle_google_user_auth(
            email=email,
            first_name=first_name,
            last_name=last_name,
            is_dev_mode=False
        )
        
    except Exception as e:
        print(f"❌ Erreur callback Google OAuth: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'error': f'Erreur lors de l\'authentification: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def _handle_google_user_auth(email, first_name='', last_name='', is_dev_mode=False):
    """
    Utilitaire pour gérer l'authentification/création d'utilisateur Google
    """
    if not email:
        return Response({
            'error': 'Email manquant'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Créer ou récupérer l'utilisateur
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email.split('@')[0],
                'first_name': first_name,
                'last_name': last_name,
                'is_active': True,
            }
        )
        
        if created:
            user.first_name = first_name
            user.last_name = last_name
            user.save()
            
            ActivityLog.objects.create(
                user=user,
                action='auth_register',
                description=f'Inscription via Google OAuth: {email}'
            )
            print(f"✓ Nouvel utilisateur Google créé: {email}")
        else:
            if first_name:
                user.first_name = first_name
            if last_name:
                user.last_name = last_name
            user.save()
            
            ActivityLog.objects.create(
                user=user,
                action='auth_login',
                description=f'Connexion via Google OAuth {f"(Dev)" if is_dev_mode else ""}'
            )
            print(f"✓ Connexion utilisateur Google: {email}")
        
        # Générer les tokens JWT
        refresh = RefreshToken.for_user(user)
        
        # Mettre à jour last_login
        user.last_login = timezone.now()
        user.save()
        
        return Response({
            'message': 'Authentification réussie',
            'user': UserSerializer(user).data,
            'token': str(refresh.access_token),
            'refresh_token': str(refresh),
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"❌ Erreur création/auth utilisateur: {str(e)}")
        return Response({
            'error': f'Erreur lors de l\'authentification: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth_view(request):
    """
    DEPRECATED - Utiliser google_oauth_callback_view à la place
    Conservé pour compatibilité avec mode développement
    """
    try:
        token = request.data.get('token')
        email = request.data.get('email')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        
        if not token:
            return Response({
                'error': 'Token manquant'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not email:
            return Response({
                'error': 'Email manquant'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mode développement uniquement
        if token.startswith('dev-mock-token-'):
            is_dev_mode = True
            print(f"⚠️  Mode développement - Authentification simple")
        else:
            is_dev_mode = False
        
        return _handle_google_user_auth(
            email=email,
            first_name=first_name,
            last_name=last_name,
            is_dev_mode=is_dev_mode
        )
        
    except Exception as e:
        print(f"❌ Erreur authentification (mode compat): {str(e)}")
        return Response({
            'error': f'Erreur lors de l\'authentification: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)