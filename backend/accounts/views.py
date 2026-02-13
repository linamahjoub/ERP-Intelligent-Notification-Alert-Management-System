from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.template.loader import render_to_string
from django.utils.html import strip_tags

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
    
    Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.
    
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
        print(f"✅ Email de bienvenue envoyé à {user.email}")
        return True
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def send_account_approved_email(user):
    """
    Envoie un email lorsque le compte est approuvé par l'admin
    """
    print("\n" + "📧"*50)
    print("📧 FONCTION send_account_approved_email EXÉCUTÉE")
    print(f"📧 Utilisateur reçu: {user.username} (ID: {user.id})")
    print(f"📧 Email destinataire: {user.email}")
    print(f"📧 FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
    print("📧"*50 + "\n")
    
    import traceback
    
    subject = '🎉 Félicitations - Votre compte SmartNotify est activé !'
    
    message = f"""
FÉLICITATIONS {user.username} !

Votre compte SmartNotify a été approuvé par notre équipe.

Vous pouvez maintenant vous connecter : {settings.FRONTEND_URL}/login

Email : {user.email}

Cordialement,
L'équipe SmartNotify
"""
    
    try:
        print("📨 Tentative d'envoi...")
        
        result = send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        print(f"✅ Envoi réussi! Résultat: {result}")
        return True
        
    except Exception as e:
        print(f"❌ ERREUR: {type(e).__name__}")
        print(f"   Message: {str(e)}")
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
    print("\n" + "🔥"*60)
    print("🔥 FONCTION approve_user_view EXÉCUTÉE")
    print(f"🔥 PK reçu: {pk}")
    print("🔥"*60 + "\n")
    
    try:
        # 1. Récupérer l'utilisateur
        print(f"🔍 Recherche utilisateur avec PK={pk}...")
        user = User.objects.get(pk=pk)
        print(f"✅ Utilisateur trouvé: {user.username}")
        print(f"   - Email: {user.email}")
        print(f"   - is_active avant: {user.is_active}")
        
        # 2. Vérifier que l'utilisateur n'est pas un admin
        if user.is_superuser or user.is_staff or user.is_primary_admin:
            print("❌ Tentative d'approuver un admin - REFUSÉ")
            return Response({
                'error': 'Impossible d\'approuver un administrateur'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 3. Activer l'utilisateur
        print("🔄 Activation de l'utilisateur...")
        user.is_active = True
        user.save()
        print(f"✅ Utilisateur activé! is_active après: {user.is_active}")
        
        # 4. Envoyer l'email de confirmation
        print("\n📧 Appel de send_account_approved_email...")
        print(f"   Paramètre: user={user.username} (ID: {user.id})")
        
        # Vérifions que la fonction existe
        print("   Vérification de la fonction...")
        if 'send_account_approved_email' in dir():
            print("   ✅ La fonction send_account_approved_email est accessible")
        else:
            print("   ❌ La fonction send_account_approved_email n'est PAS accessible")
            return Response({
                'error': 'Erreur interne: fonction email non trouvée'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Appel de la fonction
        print("   Exécution de send_account_approved_email...")
        email_sent = send_account_approved_email(user)
        print(f"   ✅ Résultat email_sent: {email_sent}")
        
        # 5. Retourner la réponse
        response_data = {
            'message': f'Utilisateur {user.username} approuvé avec succès',
            'user': UserSerializer(user).data,
            'email_sent': email_sent
        }
        print(f"\n📤 Réponse API: {response_data}")
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        print(f"❌ Utilisateur avec PK {pk} non trouvé")
        return Response({
            'error': 'Utilisateur non trouvé'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"❌ Erreur inattendue: {type(e).__name__}")
        print(f"   Message: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'error': f'Erreur lors de l\'approbation: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH', 'POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def reject_user_view(request, pk):
    """Rejeter/Supprimer un utilisateur"""
    try:
        user = User.objects.get(pk=pk)
        
        # Vérifier que l'utilisateur n'est pas un admin
        if user.is_superuser or user.is_staff or user.is_primary_admin:
            return Response({
                'error': 'Impossible de supprimer un administrateur'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        username = user.username
        user.delete()
        
        return Response({
            'message': f'Utilisateur {username} rejeté avec succès'
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({
            'error': 'Utilisateur non trouvé'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Erreur lors du rejet: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)