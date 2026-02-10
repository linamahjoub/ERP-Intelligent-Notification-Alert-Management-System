import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  People as PeopleIcon,
  Notifications as NotificationsIcon,
  CalendarToday as CalendarIcon,
  FlashOn as FlashOnIcon,
  Storage as StorageIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import notif from '../assets/notif.png';

const drawerWidth = 280;
const collapsedDrawerWidth = 80;

const SharedSidebar = ({ mobileOpen, onMobileClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(true);

  // Déterminer si l'utilisateur est admin
  const isAdmin = user?.is_superuser || user?.is_staff;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Menu items selon le rôle
  const menuItems = isAdmin ? [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/admin-dashboard',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <NotificationsIcon />,
      path: '/notifications',
      badge: user?.unread_notifications || 0,
    },
    {
      id: 'reglesalertes',
      label: 'Alert Rules',
      icon: <FlashOnIcon />,
      path: '/regles-alertes',
    },
    {
      id: 'modules',
      label: 'ERP Modules',
      icon: <StorageIcon />,
      path: '/modulesERP',
    },
    {
      id: 'admin',
      label: 'Admin Panel',
      icon: <AdminIcon />,
      path: '/admin-panel',
    }, 
    {
      id: 'history',
      label: 'History',
      icon: <CalendarIcon />,
      path: '/history',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <PeopleIcon />,
      path: '/profile',
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: <SettingsIcon />,
      path: '/settings',
    },
    {
      id: 'deconnexion',
      label: 'Déconnexion',
      icon: <LogoutIcon />,
      action: handleLogout,
    },
  ] : [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <NotificationsIcon />,
      path: '/notifications',
      badge: user?.unread_notifications || 0,
    },
    {
      id: 'reglesalertes',
      label: 'Alert Rules',
      icon: <FlashOnIcon />,
      path: '/regles-alertes',
    },
    {
      id: 'modules',
      label: 'ERP Modules',
      icon: <StorageIcon />,
      path: '/modulesERP',
    },
    {
      id: 'history',
      label: 'History',
      icon: <CalendarIcon />,
      path: '/history',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <PeopleIcon />,
      path: '/profile',
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: <SettingsIcon />,
      path: '/settings',
    },
    {
      id: 'deconnexion',
      label: 'Déconnexion',
      icon: <LogoutIcon />,
      action: handleLogout,
    },
  ];

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'black',
        borderRight: '1px solid rgba(59, 130, 246, 0.1)',
      }}
    >
      {/* Logo et titre */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: drawerOpen ? 'flex-start' : 'center',
        }}
      >
        {drawerOpen ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                bgcolor: 'black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <img
                src={notif}
                alt="SmartAlerte Logo"
                width="80"
                height="80"
              />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  color: 'white',
                  lineHeight: 1,
                }}
              >
                SmartNotify
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#64748b',
                  fontSize: '0.7rem',
                  letterSpacing: '0.5px',
                }}
              >
                {isAdmin ? 'ERP NOTIFICATIONS' : 'USER PANEL'}
              </Typography>
            </Box>
          </Box>
        ) : (
          <img
            src={notif}
            alt="SmartAlerte Logo"
            width="60"
            height="60"
            style={{ objectFit: 'contain' }}
          />
        )}
      </Box>

      {/* Menu principal */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 2 }}>
        <List sx={{ px: 2 }}>
          {menuItems.map((item) => (
            <ListItem
              key={item.id}
              button
              onClick={() => {
                if (item.action) {
                  item.action();
                } else if (item.path) {
                  navigate(item.path);
                }
                if (isMobile && onMobileClose) {
                  onMobileClose();
                }
              }}
              selected={location.pathname === item.path}
              sx={{
                mb: 0.5,
                borderRadius: 2,
                transition: 'all 0.2s ease',
                justifyContent: drawerOpen ? 'flex-start' : 'center',
                px: drawerOpen ? 2 : 1,
                '&:hover': {
                  bgcolor: 'rgba(59, 130, 246, 0.08)',
                },
                '&.Mui-selected': {
                  bgcolor: 'rgba(59, 130, 246, 0.15)',
                  '&:hover': {
                    bgcolor: 'rgba(59, 130, 246, 0.2)',
                  },
                  '& .MuiListItemIcon-root': {
                    color: '#3b82f6',
                  },
                  '& .MuiListItemText-primary': {
                    color: '#60a5fa',
                    fontWeight: 600,
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: drawerOpen ? 36 : 'auto',
                  color: location.pathname === item.path ? '#3b82f6' : '#64748b',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {drawerOpen && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    color: location.pathname === item.path ? '#60a5fa' : '#94a3b8',
                  }}
                />
              )}
              {drawerOpen && item.badge > 0 && (
                <Box
                  sx={{
                    bgcolor: '#ef4444',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    px: 1,
                    py: 0.25,
                    borderRadius: 2,
                    minWidth: 20,
                    textAlign: 'center',
                  }}
                >
                  {item.badge}
                </Box>
              )}
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Footer du drawer */}
      {drawerOpen && (
        <Box
          sx={{
            p: 2,
            m: 2,
            bgcolor: 'rgba(16, 185, 129, 0.1)',
            borderRadius: 2,
            border: '1px solid rgba(16, 185, 129, 0.2)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#10b981',
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)',
              }}
            />
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: '#10b981',
                  fontWeight: 600,
                  display: 'block',
                  fontSize: '0.85rem',
                }}
              >
                System Active
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#64748b',
                  fontSize: '0.75rem',
                }}
              >
                {isAdmin ? 'Admin mode enabled' : 'User mode'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      {/* Drawer pour desktop */}
      {!isMobile && (
        <Box
          sx={{
            width: drawerOpen ? drawerWidth : collapsedDrawerWidth,
            flexShrink: 0,
            transition: 'width 0.3s ease',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              width: drawerOpen ? drawerWidth : collapsedDrawerWidth,
              height: '100vh',
              position: 'fixed',
              left: 0,
              top: 0,
              bgcolor: 'black',
              borderRight: '1px solid rgba(59, 130, 246, 0.1)',
              transition: 'width 0.3s ease',
              overflowY: 'auto',
              overflowX: 'hidden',
              zIndex: 1200,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                bgcolor: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'rgba(59, 130, 246, 0.3)',
                borderRadius: '3px',
                '&:hover': {
                  bgcolor: 'rgba(59, 130, 246, 0.5)',
                },
              },
            }}
          >
            {drawerContent}
          </Box>

          {/* Bouton toggle */}
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              position: 'fixed',
              left: drawerOpen ? drawerWidth - 20 : collapsedDrawerWidth - 20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1300,
              bgcolor: '#3b82f6',
              color: 'white',
              width: 40,
              height: 40,
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#2563eb',
                boxShadow: '0 6px 16px rgba(59, 130, 246, 0.6)',
              },
            }}
          >
            {drawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Box>
      )}

      {/* Drawer mobile */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onMobileClose}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              border: 'none',
              bgcolor: 'black',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default SharedSidebar;