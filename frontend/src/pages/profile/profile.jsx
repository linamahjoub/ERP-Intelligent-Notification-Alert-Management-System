import Aurora from '../../components/Aurora/Aurora';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  MenuItem,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  Verified as VerifiedIcon,
  Lock as LockIcon,
  Menu as MenuIcon,
  Telegram as TelegramIcon,
  CheckCircle as CheckCircleIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import SharedSidebar from '../../components/SharedSidebar';

// Options de rôles disponibles
const roleOptions = [
  { value: 'responsable_stock', label: 'Responsable Stock' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'achats', label: 'Achats' },
  { value: 'employe', label: 'Employé' },
  { value: 'client', label: 'Client' },
  { value: 'fournisseur', label: 'Fournisseur' },
];

// Fonction pour obtenir le libellé du rôle
const getRoleLabel = (roleValue) => {
  const role = roleOptions.find(opt => opt.value === roleValue);
  return role ? role.label : (roleValue || 'Non renseigné');
};

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    phone_number: '',
    telegram_username: '',
    telegram_chat_id: '',
    company: '',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: true,
    telegram: false,
    push: true,
    frequency: 'realtime', // ✅ Déjà corrigé
  });
  
  const [securityPrefs, setSecurityPrefs] = useState({
    twoFactor: false,
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  
  // États pour la vérification OTP
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpChannel, setOtpChannel] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [pendingChannelState, setPendingChannelState] = useState(false);
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: 'success',
    message: '',
  });

  const isAdmin = user?.is_superuser || user?.is_staff;

  const notificationStorageKey = `profile_notification_prefs_${user?.id || 'default'}`;
  const securityStorageKey = `profile_security_prefs_${user?.id || 'default'}`;

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      username: user.username || '',
      phone_number: user.phone_number || '',
      telegram_username: user.telegram_username || '',
      telegram_chat_id: user.telegram_chat_id || '',
      company: user.company || '',
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    try {
      const savedNotificationPrefs = localStorage.getItem(notificationStorageKey);
      if (savedNotificationPrefs) {
        const prefs = JSON.parse(savedNotificationPrefs);
        setNotificationPrefs(prefs);
      } else {
        fetchChannelPreferences();
      }
      const savedSecurityPrefs = localStorage.getItem(securityStorageKey);
      if (savedSecurityPrefs) {
        setSecurityPrefs(JSON.parse(savedSecurityPrefs));
      }
    } catch (error) {
      console.error('Erreur chargement préférences profil:', error);
    }
  }, [user, notificationStorageKey, securityStorageKey]);

  const fetchChannelPreferences = async () => {
    try {
      const token = localStorage.getItem('access_token');
      // ✅ AJOUT: credentials: 'include' pour les cookies de session
      const res = await fetch('http://localhost:8000/api/notifications/channel_preferences/', {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setNotificationPrefs({
          email: data.email_enabled ?? true,
          telegram: data.telegram_enabled ?? false,
          push: data.in_app_enabled ?? true,
          frequency: data.schedule || 'realtime',
        });
      }
    } catch (error) {
      console.error('Erreur chargement préférences canaux:', error);
    }
  };

  useEffect(() => {
    if (!user || !isAdmin) {
      setRecentActivity([]);
      return;
    }
    const fetchRecentActivity = async () => {
      try {
        setLoadingActivity(true);
        const token = localStorage.getItem('access_token');
        // ✅ AJOUT: credentials: 'include' pour les cookies de session
        const response = await fetch('http://localhost:8000/api/activity/recent/?limit=6', {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (!response.ok) {
          setRecentActivity([]);
          return;
        }
        const data = await response.json();
        const items = Array.isArray(data) ? data : data.results || [];
        setRecentActivity(items);
      } catch (error) {
        console.error('Erreur chargement activité récente:', error);
        setRecentActivity([]);
      } finally {
        setLoadingActivity(false);
      }
    };
    fetchRecentActivity();
  }, [user, isAdmin]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleEditProfile = () => {
    navigate('/edit_profile');
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  const showFeedback = (severity, message) => {
    setSnackbar({ open: true, severity, message });
  };

  const handleSaveGeneralInfo = async () => {
    setSavingProfile(true);
    const result = await updateProfile(profileForm);
    setSavingProfile(false);
    if (result.success) {
      showFeedback('success', 'Informations générales mises à jour');
    } else {
      showFeedback('error', result.error || 'Erreur de mise à jour du profil');
    }
  };

  // Fonction pour envoyer le code OTP
  const sendOTP = async (channel, destination) => {
    setOtpLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const endpoint = channel === 'email'
        ? 'http://localhost:8000/api/notifications/send_otp_email/'
        : 'http://localhost:8000/api/notifications/send_otp_telegram/';
      
      const payload = { 
        [channel === 'email' ? 'email' : 'telegram_username']: destination 
      };
      
      // ✅ AJOUT: credentials: 'include' pour les cookies de session
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setOtpSent(true);
        showFeedback('success', `Code OTP envoyé à votre ${channel === 'email' ? 'email' : 'Telegram'}`);
      } else {
        showFeedback('error', data.error || `Erreur lors de l'envoi du code OTP ${channel === 'email' ? 'par email' : 'Telegram'}`);
        setOtpDialogOpen(false);
        setOtpChannel(null);
      }
    } catch (error) {
      console.error('Erreur envoi OTP:', error);
      showFeedback('error', `Erreur lors de l'envoi du code OTP ${channel === 'email' ? 'par email' : 'Telegram'}`);
      setOtpDialogOpen(false);
      setOtpChannel(null);
    } finally {
      setOtpLoading(false);
    }
  };

  // Fonction pour vérifier le code OTP
  const verifyOTP = async () => {
    if (!otpCode || otpCode.length < 6) {
      showFeedback('error', 'Veuillez entrer un code OTP valide (6 chiffres)');
      return;
    }
    
    setVerificationInProgress(true);
    try {
      const token = localStorage.getItem('access_token');
      const endpoint = otpChannel === 'email'
        ? 'http://localhost:8000/api/notifications/verify_otp_email/'
        : 'http://localhost:8000/api/notifications/verify_otp_telegram/';
      
      const payload = { otp_code: otpCode };
      
      // ✅ AJOUT: credentials: 'include' pour les cookies de session
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (response.ok && data.verified) {
        const updatedPrefs = {
          ...notificationPrefs,
          [otpChannel]: pendingChannelState,
        };
        setNotificationPrefs(updatedPrefs);
        await saveNotificationPreferencesToServer(updatedPrefs);
        localStorage.setItem(notificationStorageKey, JSON.stringify(updatedPrefs));
        showFeedback('success', `${otpChannel === 'email' ? 'Email' : 'Telegram'} activé avec succès`);
        setOtpDialogOpen(false);
        setOtpCode('');
        setOtpSent(false);
        setOtpChannel(null);
      } else {
        showFeedback('error', data.error || 'Code OTP invalide');
      }
    } catch (error) {
      console.error('Erreur vérification OTP:', error);
      showFeedback('error', 'Erreur lors de la vérification du code');
    } finally {
      setVerificationInProgress(false);
    }
  };

 const saveNotificationPreferencesToServer = async (prefs) => {
  console.log('📤 Envoi au serveur...');
  console.log('   email_enabled:', prefs.email);
  console.log('   telegram_enabled:', prefs.telegram);
  console.log('   frequency:', prefs.frequency);
  
  const token = localStorage.getItem('access_token');
  console.log('🔑 Token:', token ? '✓ Présent' : '✗ Manquant');
  
  if (!token) {
    throw new Error('Token manquant');
  }
  
  const response = await fetch('http://localhost:8000/api/notifications/channel_preferences/', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      email_enabled: prefs.email,
      telegram_enabled: prefs.telegram,
      in_app_enabled: prefs.push,
      schedule: prefs.frequency,
    }),
    credentials: 'include',
  });
  
  console.log('📡 Réponse:', response.status, response.statusText);
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error('❌ Erreur serveur:', errorData);
    throw new Error(`Erreur ${response.status}: ${JSON.stringify(errorData)}`);
  }
  
  const data = await response.json();
  console.log('✅ Réponse serveur:', data);
  return data;
};
  // Gestionnaire pour le switch Telegram
  const handleTelegramToggle = async (checked) => {
    if (checked) {
      if (!profileForm.telegram_username) {
        showFeedback('error', 'Veuillez d\'abord configurer votre nom d\'utilisateur Telegram dans les informations générales');
        return;
      }
      setOtpChannel('telegram');
      setPendingChannelState(true);
      setOtpDialogOpen(true);
      setOtpSent(false);
      setOtpCode('');
      await sendOTP('telegram', profileForm.telegram_username);
    } else {
      const updatedPrefs = { ...notificationPrefs, telegram: false };
      setNotificationPrefs(updatedPrefs);
      await saveNotificationPreferencesToServer(updatedPrefs);
      localStorage.setItem(notificationStorageKey, JSON.stringify(updatedPrefs));
      showFeedback('success', 'Telegram désactivé');
    }
  };

  // Gestionnaire pour le switch Email
  const handleEmailToggle = async (checked) => {
    if (checked && !notificationPrefs.email) {
      if (!user?.email) {
        showFeedback('error', 'Aucune adresse email configurée pour votre compte');
        return;
      }
      setOtpChannel('email');
      setPendingChannelState(true);
      setOtpDialogOpen(true);
      setOtpSent(false);
      setOtpCode('');
      await sendOTP('email', user.email);
    } else if (!checked && notificationPrefs.email) {
      const updatedPrefs = { ...notificationPrefs, email: false };
      setNotificationPrefs(updatedPrefs);
      await saveNotificationPreferencesToServer(updatedPrefs);
      localStorage.setItem(notificationStorageKey, JSON.stringify(updatedPrefs));
      showFeedback('success', 'Email désactivé');
    }
  };
const handleSaveNotificationPrefs = async () => {
  console.log('🔵 handleSaveNotificationPrefs appelé !');
  console.log('📦 notificationPrefs actuelles:', notificationPrefs);
  
  try {
    await saveNotificationPreferencesToServer(notificationPrefs);
    localStorage.setItem(notificationStorageKey, JSON.stringify(notificationPrefs));
    showFeedback('success', 'Préférences de notification enregistrées');
    console.log('✅ Sauvegarde terminée avec succès');
  } catch (error) {
    console.error('❌ Erreur dans handleSaveNotificationPrefs:', error);
    showFeedback('error', 'Erreur lors de la sauvegarde');
  }
};

  const handleSaveSecurityPrefs = () => {
    localStorage.setItem(securityStorageKey, JSON.stringify(securityPrefs));
    showFeedback('success', 'Paramètres de sécurité enregistrés');
  };

  const handleChangePasswordInline = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showFeedback('error', 'Veuillez remplir tous les champs du mot de passe');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showFeedback('error', 'Le nouveau mot de passe et la confirmation ne correspondent pas');
      return;
    }
    setSavingPassword(true);
    const result = await changePassword(
      passwordForm.oldPassword,
      passwordForm.newPassword,
      passwordForm.confirmPassword
    );
    setSavingPassword(false);
    if (result.success) {
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      showFeedback('success', 'Mot de passe modifié avec succès');
    } else {
      showFeedback('error', String(result.error || 'Impossible de changer le mot de passe'));
    }
  };

  if (!user) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'black',
      }}>
        <Typography variant="h4" sx={{ color: 'white' }}>
          Chargement...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'black', position: 'relative' }}>
      {/* Aurora Background */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          pointerEvents: "none",
          opacity: 0.4,
        }}
      >
        <Aurora
          colorStops={["#66a1ff", "#B19EEF", "#5227FF"]}
          blend={0.5}
          amplitude={1.0}
          speed={1}
        />
      </Box>

      {/* Sidebar partagé */}
      <SharedSidebar 
        mobileOpen={mobileOpen} 
        onMobileClose={handleDrawerToggle}
      />

      {/* Contenu principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          minHeight: '100vh',
          bgcolor: 'black',
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative',
          zIndex: 1,
          '&::-webkit-scrollbar': { width: '8px' },
          '&::-webkit-scrollbar-track': { bgcolor: 'rgba(15, 23, 42, 0.4)' },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(59, 130, 246, 0.3)',
            borderRadius: '4px',
            '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.5)' },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 1.2,
            borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          {isMobile && (
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                color: 'white',
                mr: 1,
                '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.1)' },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
              Mon Profil
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.9rem' }}>
              Gérez vos informations personnelles et paramètres
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<LockIcon />}
              onClick={handleChangePassword}
              sx={{
                color: '#3b82f6',
                borderColor: 'rgba(59, 130, 246, 0.3)',
                textTransform: 'none',
                '&:hover': { borderColor: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.1)' },
              }}
            >
              Changer le mot de passe
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEditProfile}
              sx={{
                bgcolor: '#3b82f6',
                color: 'white',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                '&:hover': { bgcolor: '#2563eb', boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)' },
              }}
            >
              Modifier
            </Button>
          </Box>
        </Box>

        {/* Contenu de la page Profile */}
        <Box sx={{ p: 3, pb: 6 }}>
          {/* En-tête avec avatar */}
          <Card sx={{ 
            bgcolor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            borderRadius: 3,
            mb: 4,
            overflow: 'hidden',
          }}>
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={3}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        bgcolor: isAdmin ? '#ef4444' : '#3b82f6',
                        fontSize: '3rem',
                        fontWeight: 700,
                        mb: 2,
                        border: '4px solid rgba(59, 130, 246, 0.2)',
                      }}
                    >
                      {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </Avatar>
                    <Box
                      sx={{
                        bgcolor: isAdmin ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        color: isAdmin ? '#ef4444' : '#3b82f6',
                        px: 2,
                        py: 0.5,
                        borderRadius: 4,
                        fontSize: '0.85rem',
                        fontWeight: 600,
                      }}
                    >
                      {isAdmin ? 'ADMINISTRATEUR' : 'UTILISATEUR'}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={9}>
                  <Typography variant="h3" sx={{ color: 'white', fontWeight: 800, mb: 1, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
                    {user?.first_name} {user?.last_name}
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#94a3b8', fontWeight: 500, mb: 3 }}>
                    @{user?.username}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <VerifiedIcon sx={{ color: '#10b981', fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>Statut du compte</Typography>
                          <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                            {user?.is_active ? 'Actif' : 'Inactif'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CalendarIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>Membre depuis</Typography>
                          <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                            {new Date(user?.date_joined || Date.now()).toLocaleDateString('fr-FR')}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Cartes d'informations */}
          <Grid container spacing={3}>
            {/* Informations personnelles */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                bgcolor: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(59, 130, 246, 0.1)',
                borderRadius: 3,
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': { borderColor: 'rgba(59, 130, 246, 0.3)', transform: 'translateY(-2px)', boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)' },
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PersonIcon sx={{ color: '#3b82f6', fontSize: 24 }} />
                    </Box>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>Informations Personnelles</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    {[
                      { label: 'Prénom', value: user?.first_name || 'Non renseigné', icon: <PersonIcon /> },
                      { label: 'Nom', value: user?.last_name || 'Non renseigné', icon: <PersonIcon /> },
                      { label: 'Nom d\'utilisateur', value: user?.username || 'Non renseigné', icon: <BadgeIcon /> },
                      { label: 'Email', value: user?.email || 'Non renseigné', icon: <EmailIcon /> },
                      { label: 'Téléphone', value: user?.phone_number || 'Non renseigné', icon: <PhoneIcon /> },
                      { label: 'Telegram', value: user?.telegram_username || 'Non renseigné', icon: <TelegramIcon /> },
                      { label: 'Rôle', value: isAdmin ? 'Administrateur' : getRoleLabel(user?.role), icon: <BadgeIcon /> },
                    ].map((field, index) => (
                      <Grid item xs={12} key={index}>
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 0.5 }}>{field.label}</Typography>
                          <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>{field.value}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Contact */}
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                bgcolor: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(59, 130, 246, 0.1)',
                borderRadius: 3,
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': { borderColor: 'rgba(59, 130, 246, 0.3)', transform: 'translateY(-2px)', boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)' },
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <EmailIcon sx={{ color: '#3b82f6', fontSize: 24 }} />
                    </Box>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>Contact</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    {[
                      { label: 'Email', value: user?.email || 'Non renseigné', icon: <EmailIcon /> },
                      { label: 'Téléphone', value: user?.phone_number || 'Non renseigné', icon: <PhoneIcon /> },
                      { label: 'Telegram', value: user?.telegram_username || 'Non renseigné', icon: <TelegramIcon /> },
                      { label: 'Adresse', value: user?.address || user?.adresse || 'Non renseigné', icon: <HomeIcon /> },
                    ].map((field, index) => (
                      <Grid item xs={12} key={index}>
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 0.5 }}>{field.label}</Typography>
                          <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>{field.value}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Préférences notifications */}
            <Grid item xs={12} md={6}>
              <Card sx={{
                bgcolor: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(59, 130, 246, 0.1)',
                borderRadius: 3,
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': { borderColor: 'rgba(59, 130, 246, 0.3)', transform: 'translateY(-2px)', boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)' },
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <SendIcon sx={{ color: '#3b82f6', fontSize: 24 }} />
                    </Box>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>Préférences de Notification</Typography>
                  </Box>
                  
                  <FormControlLabel
                    control={<Switch checked={notificationPrefs.email} onChange={(e) => handleEmailToggle(e.target.checked)} />}
                    label="Email"
                    sx={{ color: 'white', display: 'block', mb: 2 }}
                  />
                  {notificationPrefs.email && (
                    <Typography variant="caption" sx={{ color: '#10b981', display: 'block', mb: 2, ml: 4 }}>
                      ✓ Activé - Vous recevrez les notifications par email
                    </Typography>
                  )}
                  
                  <FormControlLabel
                    control={<Switch checked={notificationPrefs.telegram} onChange={(e) => handleTelegramToggle(e.target.checked)} disabled={!profileForm.telegram_username} />}
                    label="Telegram"
                    sx={{ color: 'white', display: 'block', mb: 2 }}
                  />
                  {!profileForm.telegram_username && (
                    <Typography variant="caption" sx={{ color: '#f59e0b', display: 'block', mb: 2, ml: 4 }}>
                      ⚠ Configurez votre nom d'utilisateur Telegram dans les informations générales
                    </Typography>
                  )}
                  {notificationPrefs.telegram && profileForm.telegram_username && (
                    <Typography variant="caption" sx={{ color: '#10b981', display: 'block', mb: 2, ml: 4 }}>
                      ✓ Activé - Vous recevrez les notifications sur Telegram (@{profileForm.telegram_username})
                    </Typography>
                  )}
                  
                  <FormControlLabel
                    control={<Switch checked={notificationPrefs.push} onChange={(e) => setNotificationPrefs({ ...notificationPrefs, push: e.target.checked })} />}
                    label="Notifications Push"
                    sx={{ color: 'white', display: 'block', mb: 2 }}
                  />

                  <TextField
                    select
                    fullWidth
                    label="Fréquence"
                    value={notificationPrefs.frequency}
                    onChange={(e) => setNotificationPrefs({ ...notificationPrefs, frequency: e.target.value })}
                    sx={{ mb: 2 }}
                    InputLabelProps={{ sx: { color: '#94a3b8' } }}
                    SelectProps={{ sx: { color: 'white' } }}
                  >
                    <MenuItem value="realtime">Temps réel</MenuItem>
                    <MenuItem value="hourly">Chaque heure</MenuItem>
                    <MenuItem value="daily">Quotidien</MenuItem>
                  </TextField>

                  <Button variant="contained" onClick={handleSaveNotificationPrefs} sx={{ textTransform: 'none' }}>
                    Sauvegarder
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Paramètres sécurité */}
            <Grid item xs={12} md={6}>
              <Card sx={{
                bgcolor: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(59, 130, 246, 0.1)',
                borderRadius: 3,
                height: '100%',
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>Paramètres de Sécurité</Typography>
                  <FormControlLabel
                    control={<Switch checked={securityPrefs.twoFactor} onChange={(e) => setSecurityPrefs({ ...securityPrefs, twoFactor: e.target.checked })} />}
                    label="Activer la double authentification (2FA)"
                    sx={{ color: 'white', mb: 2 }}
                  />
                  <Button variant="outlined" onClick={handleSaveSecurityPrefs} sx={{ textTransform: 'none' }}>
                    Enregistrer 2FA
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Informations générales modifiables */}
            <Grid item xs={12} md={6}>
              <Card sx={{
                bgcolor: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(59, 130, 246, 0.1)',
                borderRadius: 3,
                height: '100%',
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>Informations Générales</Typography>
                  <TextField fullWidth label="Prénom" value={profileForm.first_name} onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })} sx={{ mb: 2 }} InputLabelProps={{ sx: { color: '#94a3b8' } }} inputProps={{ style: { color: 'white' } }} />
                  <TextField fullWidth label="Nom" value={profileForm.last_name} onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })} sx={{ mb: 2 }} InputLabelProps={{ sx: { color: '#94a3b8' } }} inputProps={{ style: { color: 'white' } }} />
                  <TextField fullWidth label="Nom d'utilisateur" value={profileForm.username} onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })} sx={{ mb: 2 }} InputLabelProps={{ sx: { color: '#94a3b8' } }} inputProps={{ style: { color: 'white' } }} />
                  <TextField fullWidth label="Téléphone" value={profileForm.phone_number} onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })} sx={{ mb: 2 }} InputLabelProps={{ sx: { color: '#94a3b8' } }} inputProps={{ style: { color: 'white' } }} />
                  <TextField fullWidth label="Nom d'utilisateur Telegram" value={profileForm.telegram_username} onChange={(e) => setProfileForm({ ...profileForm, telegram_username: e.target.value })} sx={{ mb: 2 }} InputLabelProps={{ sx: { color: '#94a3b8' } }} inputProps={{ style: { color: 'white' } }} helperText="Format: @username ou username (sans @)" />
                  <TextField fullWidth label="Entreprise" value={profileForm.company} onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })} sx={{ mb: 2 }} InputLabelProps={{ sx: { color: '#94a3b8' } }} inputProps={{ style: { color: 'white' } }} />
                  <Button variant="contained" onClick={handleSaveGeneralInfo} disabled={savingProfile} sx={{ textTransform: 'none' }}>
                    {savingProfile ? 'Enregistrement...' : 'Sauvegarder les informations'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Rôles & Permissions */}
            <Grid item xs={12}>
              <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(59, 130, 246, 0.1)', borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>Rôles & Permissions</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>Rôle actuel</Typography>
                      <Typography sx={{ color: 'white', fontWeight: 600 }}>{isAdmin ? 'Administrateur' : getRoleLabel(user?.role)}</Typography>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', mb: 1 }}>Permissions actives</Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {[user?.is_superuser ? 'Accès total' : null, user?.is_staff ? 'Backoffice' : null, user?.is_active ? 'Compte actif' : 'Compte inactif']
                          .filter(Boolean)
                          .map((permission) => (
                            <Chip key={permission} label={permission} size="small" sx={{ bgcolor: 'rgba(59,130,246,0.1)', color: '#3b82f6' }} />
                          ))}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          
            {/* Footer avec informations */}
            <Box sx={{ mt: 4, p: 3, bgcolor: 'rgba(30, 41, 59, 0.5)', borderRadius: 2, border: '1px solid rgba(59, 130, 246, 0.1)', width: '100%' }}>
              <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center' }}>
                Dernière mise à jour: {new Date(user?.date_joined || Date.now()).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} • 
                Votre compte est sécurisé avec l'authentification à deux facteurs
              </Typography>
            </Box>
          </Grid>
        </Box>
      </Box>

      {/* Dialog de vérification OTP */}
      <Dialog 
        open={otpDialogOpen} 
        onClose={() => {
          if (!verificationInProgress) {
            setOtpDialogOpen(false);
            setOtpCode('');
            setOtpSent(false);
            setOtpChannel(null);
          }
        }}
        PaperProps={{
          sx: {
            bgcolor: '#0f172a',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: 3,
            minWidth: { xs: '90%', sm: 400 },
          }
        }}
      >
        <DialogTitle sx={{ color: 'white', borderBottom: '1px solid rgba(59, 130, 246, 0.2)', pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {otpChannel === 'telegram' ? <TelegramIcon sx={{ color: '#229ED9' }} /> : <EmailIcon sx={{ color: '#ef4444' }} />}
            <Typography component="span" sx={{ fontWeight: 700 }}>
              Vérification {otpChannel === 'telegram' ? 'Telegram' : 'Email'}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          <Typography sx={{ color: '#94a3b8', mb: 2 }}>
            Un code de vérification a été envoyé à votre {otpChannel === 'telegram' ? 'compte Telegram' : 'adresse email'}.
            Veuillez saisir le code à 6 chiffres ci-dessous pour activer les notifications.
          </Typography>
          
          {otpChannel === 'telegram' && profileForm.telegram_username && (
            <Typography sx={{ color: '#229ED9', mb: 2, fontSize: '0.85rem' }}>
              📱 Destinataire: @{profileForm.telegram_username}
            </Typography>
          )}
          
          {otpChannel === 'email' && user?.email && (
            <Typography sx={{ color: '#ef4444', mb: 2, fontSize: '0.85rem' }}>
              📧 Destinataire: {user.email}
            </Typography>
          )}
          
          <TextField
            fullWidth
            label="Code OTP"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            placeholder="123456"
            autoFocus
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(59, 130, 246, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(59, 130, 246, 0.5)' },
              },
              '& .MuiInputLabel-root': { color: '#94a3b8' },
            }}
          />
          
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
            Le code est valable 5 minutes. Si vous n'avez pas reçu le code, vérifiez vos spams ou réessayez.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1, borderTop: '1px solid rgba(59, 130, 246, 0.2)', gap: 2 }}>
          <Button 
            onClick={() => {
              setOtpDialogOpen(false);
              setOtpCode('');
              setOtpSent(false);
              setOtpChannel(null);
            }}
            disabled={verificationInProgress}
            sx={{ color: '#94a3b8', textTransform: 'none' }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={verifyOTP}
            disabled={!otpCode || verificationInProgress}
            startIcon={verificationInProgress ? <CircularProgress size={20} /> : <CheckCircleIcon />}
            sx={{
              bgcolor: '#3b82f6',
              textTransform: 'none',
              '&:hover': { bgcolor: '#2563eb' },
            }}
          >
            {verificationInProgress ? 'Vérification...' : 'Vérifier et activer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;