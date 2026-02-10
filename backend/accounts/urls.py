from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # ==================== AUTHENTIFICATION ====================
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # ==================== PROFIL UTILISATEUR ====================
    path('user/', views.user_profile_view, name='user_profile'),
    path('change-password/', views.change_password_view, name='change_password'),
    
    # ==================== ADMIN - GESTION UTILISATEURS ====================
    path('users/', views.UserListCreateView.as_view(), name='user_list_create'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user_detail'),
    path('users/stats/', views.user_stats_view, name='user_stats'),
    
    # ==================== UTILITAIRES ====================
    path('check-email/', views.check_email_exists, name='check_email'),
]