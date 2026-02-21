import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Paper,
  useTheme,
  useMediaQuery,
  Button
} from '@mui/material';
import {
  Edit as EditIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Badge as BadgeIcon,
  Security as SecurityIcon,
  CalendarToday as CalendarIcon,
  Verified as VerifiedIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import SharedSidebar from '../components/SharedSidebar';

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleEditProfile = () => {
    navigate('/edit_profile');
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  // Détermine si l'utilisateur est admin
  const isAdmin = user?.is_superuser || user?.is_staff;

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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'black' }}>
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
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'rgba(15, 23, 42, 0.4)',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(59, 130, 246, 0.3)',
            borderRadius: '4px',
            '&:hover': {
              bgcolor: 'rgba(59, 130, 246, 0.5)',
            },
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
          {/* Menu mobile icon */}
          {isMobile && (
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                color: 'white',
                mr: 1,
                '&:hover': {
                  bgcolor: 'rgba(59, 130, 246, 0.1)',
                },
              }}
            >
              <PersonIcon />
            </IconButton>
          )}

          {/* Titre */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h5"
              sx={{
                color: 'white',
                fontWeight: 700,
                fontSize: { xs: '1.2rem', sm: '1.5rem' },
              }}
            >
              Mon Profil
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                fontSize: '0.9rem',
              }}
            >
              Gérez vos informations personnelles et paramètres
            </Typography>
          </Box>

          {/* Bouton d'action */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<LockIcon />}
              onClick={handleChangePassword}
              sx={{
                color: '#3b82f6',
                borderColor: 'rgba(59, 130, 246, 0.3)',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#3b82f6',
                  bgcolor: 'rgba(59, 130, 246, 0.1)',
                }
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
                '&:hover': {
                  bgcolor: '#2563eb',
                  boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)',
                }
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
                  <Typography
                    variant="h3"
                    sx={{
                      color: 'white',
                      fontWeight: 800,
                      mb: 1,
                      fontSize: { xs: '1.8rem', md: '2.5rem' },
                    }}
                  >
                    {user?.first_name} {user?.last_name}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#94a3b8',
                      fontWeight: 500,
                      mb: 3,
                    }}
                  >
                    @{user?.username}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Box sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: 'rgba(16, 185, 129, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <VerifiedIcon sx={{ color: '#10b981', fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                            Statut du compte
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                            {user?.is_active ? 'Actif' : 'Inactif'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Box sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: 'rgba(59, 130, 246, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <CalendarIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                            Membre depuis
                          </Typography>
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
                '&:hover': {
                  borderColor: 'rgba(59, 130, 246, 0.3)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)',
                },
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: 'rgba(59, 130, 246, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <PersonIcon sx={{ color: '#3b82f6', fontSize: 24 }} />
                    </Box>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                      Informations Personnelles
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    {[
                      { label: 'Prénom', value: user?.first_name || 'Non renseigné', icon: <PersonIcon /> },
                      { label: 'Nom', value: user?.last_name || 'Non renseigné', icon: <PersonIcon /> },
                      { label: 'Nom d\'utilisateur', value: user?.username || 'Non renseigné', icon: <BadgeIcon /> },
                      { label: 'Email', value: user?.email || 'Non renseigné', icon: <EmailIcon /> },
                      { label: 'Téléphone', value: user?.phone_number || 'Non renseigné', icon: <PhoneIcon /> },
                      { label: 'Rôle', value: getRoleLabel(user?.role), icon: <BadgeIcon /> },
                    ].map((field, index) => (
                      <Grid item xs={12} key={index}>
                        <Box sx={{ 
                          p: 2, 
                          borderRadius: 2,
                          bgcolor: 'rgba(59, 130, 246, 0.05)',
                          border: '1px solid rgba(59, 130, 246, 0.1)',
                        }}>
                          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 0.5 }}>
                            {field.label}
                          </Typography>
                          <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                            {field.value}
                          </Typography>
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
                '&:hover': {
                  borderColor: 'rgba(59, 130, 246, 0.3)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)',
                },
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: 'rgba(59, 130, 246, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <EmailIcon sx={{ color: '#3b82f6', fontSize: 24 }} />
                    </Box>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                      Contact
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    {[
                      { label: 'Email', value: user?.email || 'Non renseigné', icon: <EmailIcon /> },
                      { label: 'Téléphone', value: user?.phone_number || 'Non renseigné', icon: <PhoneIcon /> },
                      { label: 'Adresse', value: user?.address || user?.adresse || 'Non renseigné', icon: <HomeIcon /> },
                    ].map((field, index) => (
                      <Grid item xs={12} key={index}>
                        <Box sx={{ 
                          p: 2, 
                          borderRadius: 2,
                          bgcolor: 'rgba(59, 130, 246, 0.05)',
                          border: '1px solid rgba(59, 130, 246, 0.1)',
                        }}>
                          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 0.5 }}>
                            {field.label}
                          </Typography>
                          <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                            {field.value}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

          </Grid>
          {/* Footer avec informations */}
          <Box sx={{ 
            mt: 4, 
            p: 3, 
            bgcolor: 'rgba(30, 41, 59, 0.5)',
            borderRadius: 2,
            border: '1px solid rgba(59, 130, 246, 0.1)',
          }}>
            <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center' }}>
              Dernière mise à jour: {new Date(user?.date_joined || Date.now()).toLocaleDateString('fr-FR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })} • 
              Votre compte est sécurisé avec l'authentification à deux facteurs
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Profile;