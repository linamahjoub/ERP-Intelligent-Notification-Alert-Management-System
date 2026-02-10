import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Button,
  LinearProgress,
  Tabs,
  Tab,
  Paper,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Storage as StorageIcon,
  Add as AddIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Info as InfoIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SharedSidebar from '../components/SharedSidebar';

const ModulesERP = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

  // Détermine si l'utilisateur est admin
  const isAdmin = user?.is_superuser || user?.is_staff || false;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const erpModules = [
    { 
      id: 1, 
      name: 'STOCK Gestion des Stocks', 
      status: 'Active', 
      services: 'All services running',
      version: '2.4.1',
      lastUpdate: '2024-01-15',
      uptime: '99.8%',
      description: 'Gestion complète des stocks et inventaire',
      activeUsers: 45,
      notificationsCount: 12
    },
    { 
      id: 2, 
      name: 'CRM Relation Client', 
      status: 'Active', 
      services: 'All services running',
      version: '3.1.0',
      lastUpdate: '2024-01-10',
      uptime: '99.5%',
      description: 'Gestion de la relation client et des ventes',
      activeUsers: 32,
      notificationsCount: 8
    },
    { 
      id: 3, 
      name: 'FINANCE', 
      status: 'Active', 
      services: 'All services running',
      version: '1.8.3',
      lastUpdate: '2024-01-05',
      uptime: '99.9%',
      description: 'Gestion financière et comptabilité',
      activeUsers: 28,
      notificationsCount: 5
    },
    { 
      id: 4, 
      name: 'RH', 
      status: 'Active', 
      services: 'All services running',
      version: '2.0.1',
      lastUpdate: '2024-01-12',
      uptime: '99.7%',
      description: 'Gestion des ressources humaines',
      activeUsers: 38,
      notificationsCount: 15
    },
    { 
      id: 5, 
      name: 'PRODUCTION', 
      status: 'Inactive', 
      services: '3/5 services running',
      version: '1.5.2',
      lastUpdate: '2023-12-20',
      uptime: '85.2%',
      description: 'Gestion de la production et planification',
      activeUsers: 18,
      notificationsCount: 23
    },
    { 
      id: 6, 
      name: 'ACHATS', 
      status: 'Maintenance', 
      services: 'Service en maintenance',
      version: '1.2.0',
      lastUpdate: '2024-01-18',
      uptime: '0%',
      description: 'Gestion des achats et fournisseurs',
      activeUsers: 0,
      notificationsCount: 3
    }
  ];

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'success';
      case 'Inactive': return 'warning';
      case 'Maintenance': return 'info';
      default: return 'default';
    }
  };

  const handleModuleAction = (moduleId, action) => {
    console.log(`${action} module ${moduleId}`);
    // Ici vous ajouterez la logique pour les actions sur les modules
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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'black' }}>
      {/* Sidebar partagé qui s'adapte au rôle */}
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
              <MenuIcon />
            </IconButton>
          )}

          {/* Barre de recherche */}
          <Box
            sx={{
              flex: 1,
              maxWidth: 500,
              position: 'relative',
            }}
          >
            <SearchIcon
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                fontSize: 20,
              }}
            />
            <input
              type="text"
              placeholder="Rechercher un module..."
              style={{
                width: '100%',
                padding: '12px 16px 12px 48px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '12px',
                color: '#94a3b8',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
              }}
            />
          </Box>

          {/* Boutons d'action */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              sx={{
                color: '#64748b',
                position: 'relative',
                '&:hover': {
                  bgcolor: 'rgba(59, 130, 246, 0.1)',
                },
              }}
            >
              <NotificationsIcon />
              {user?.unread_notifications > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    bgcolor: '#ef4444',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {user.unread_notifications}
                </Box>
              )}
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  {user?.first_name || user?.username}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748b',
                    fontSize: '0.75rem',
                  }}
                >
                  {isAdmin ? 'Administrateur' : 'Utilisateur'}
                </Typography>
              </Box>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: isAdmin ? '#ef4444' : '#3b82f6',
                  fontWeight: 600,
                  fontSize: '1rem',
                }}
              >
                {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </Avatar>
            </Box>
          </Box>
        </Box>

        {/* Contenu de la page Modules ERP */}
        <Box sx={{ p: 3, pb: 6 }}>
          {/* En-tête de la page */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    mb: 0.5,
                  }}
                >
                  Modules ERP
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#64748b',
                    fontSize: '0.95rem',
                  }}
                >
                  Gérez et surveillez tous vos modules ERP
                </Typography>
              </Box>

              {/* Boutons d'action */}
              {isAdmin && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{
                    bgcolor: '#3b82f6',
                    color: 'white',
                    fontWeight: 600,
                    py: 1.2,
                    px: 3,
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    '&:hover': {
                      bgcolor: '#2563eb',
                      boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)',
                    }
                  }}
                >
                  Ajouter un Module
                </Button>
              )}
            </Box>
          </Box>

          {/* Tabs */}
          <Paper sx={{ 
            bgcolor: 'rgba(30, 41, 59, 0.5)', 
            mb: 3,
            borderRadius: 2,
            border: '1px solid rgba(59, 130, 246, 0.1)'
          }}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  color: '#94a3b8',
                  fontWeight: 500,
                  '&.Mui-selected': {
                    color: '#3b82f6',
                  }
                },
                '& .MuiTabs-indicator': {
                  bgcolor: '#3b82f6',
                }
              }}
            >
              <Tab label="Tous les Modules" />
              <Tab label="Actifs" />
              <Tab label="En Maintenance" />
              <Tab label="Statistiques" />
            </Tabs>
          </Paper>

          {/* Statistiques rapides */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                bgcolor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(59, 130, 246, 0.2)',
                },
              }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                    {erpModules.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Modules Totaux
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                bgcolor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)',
                },
              }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                    {erpModules.filter(m => m.status === 'Active').length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Modules Actifs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                bgcolor: 'rgba(251, 146, 60, 0.1)',
                border: '1px solid rgba(251, 146, 60, 0.2)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(251, 146, 60, 0.2)',
                },
              }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                    {erpModules.filter(m => m.status === 'Inactive').length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Modules Inactifs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                bgcolor: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(139, 92, 246, 0.2)',
                },
              }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                    {erpModules.filter(m => m.status === 'Maintenance').length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    En Maintenance
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Liste des modules */}
          <Grid container spacing={3}>
            {erpModules.map((module) => (
              <Grid item xs={12} md={6} key={module.id}>
                <Card sx={{ 
                  bgcolor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(59, 130, 246, 0.1)',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    {/* En-tête du module */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                          width: 50,
                          height: 50,
                          borderRadius: 2,
                          bgcolor: 'rgba(59, 130, 246, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <StorageIcon sx={{ color: '#3b82f6', fontSize: 28 }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                            {module.name.split(' ')[0]}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            {module.name.split(' ').slice(1).join(' ')}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip 
                        label={module.status}
                        color={getStatusColor(module.status)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>

                    {/* Description */}
                    <Typography variant="body2" sx={{ 
                      color: '#cbd5e1',
                      mb: 2,
                      fontSize: '0.9rem'
                    }}>
                      {module.description}
                    </Typography>

                    {/* Informations */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                          Version
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                          {module.version}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                          Uptime
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                          {module.uptime}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                          Utilisateurs
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                          {module.activeUsers} actifs
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                          Notifications
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: module.notificationsCount > 10 ? '#ef4444' : '#3b82f6',
                          fontWeight: 500 
                        }}>
                          {module.notificationsCount}
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* Barre de progression de l'uptime */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          Performance
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          {module.uptime}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={parseFloat(module.uptime)} 
                        sx={{ 
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'rgba(59, 130, 246, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: module.uptime === '99.9%' ? '#10b981' : 
                                     module.uptime === '99.8%' ? '#3b82f6' : 
                                     module.uptime === '99.5%' ? '#f59e0b' : '#ef4444'
                          }
                        }}
                      />
                    </Box>

                    {/* Actions */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      pt: 1,
                      borderTop: '1px solid rgba(59, 130, 246, 0.1)'
                    }}>
                      {isAdmin && (
                        <IconButton 
                          size="small"
                          onClick={() => handleModuleAction(module.id, module.status === 'Active' ? 'stop' : 'start')}
                          sx={{ 
                            color: module.status === 'Active' ? '#ef4444' : '#10b981' 
                          }}
                        >
                          {module.status === 'Active' ? 
                            <PauseIcon fontSize="small" /> : 
                            <PlayArrowIcon fontSize="small" />
                          }
                        </IconButton>
                      )}

                      <Button
                        variant="outlined"
                        size="small"
                        endIcon={<InfoIcon />}
                        sx={{
                          color: '#3b82f6',
                          borderColor: 'rgba(59, 130, 246, 0.3)',
                          fontSize: '0.75rem',
                          '&:hover': {
                            borderColor: '#3b82f6',
                            bgcolor: 'rgba(59, 130, 246, 0.1)',
                          }
                        }}
                        onClick={() => navigate(`/modules/${module.id}`)}
                      >
                        Détails
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Footer avec informations système */}
          <Box sx={{ 
            mt: 4, 
            p: 3, 
            bgcolor: 'rgba(30, 41, 59, 0.5)',
            borderRadius: 2,
            border: '1px solid rgba(59, 130, 246, 0.1)'
          }}>
            <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center' }}>
              Système ERP • Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')} • 
              Tous les services sont surveillés en temps réel
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ModulesERP;