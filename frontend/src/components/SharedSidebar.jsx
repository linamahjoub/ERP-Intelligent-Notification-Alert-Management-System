import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Typography,
  Collapse,
  Drawer,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  People as PeopleIcon,
  Notifications as NotificationsIcon,
  CalendarToday as CalendarIcon,
  FlashOn as FlashOnIcon,
  PersonAdd as PersonAddIcon,
  Storage as StorageIcon,
  AdminPanelSettings as AdminIcon,
  Inventory as InventoryIcon,
  ExpandMore as ExpandMoreIcon,
  AddBox as AddBoxIcon,
  List as ListIcon,
  BarChart as BarChartIcon,
  LocalOffer as TagIcon,
  Category as CategoryIcon,
  Layers as LayersIcon,
  MoveToInbox as LotIcon,
  Tune as AttributeIcon,
  Warehouse as WarehouseIcon,
  AddBusiness as AddWarehouseIcon,
  RoomService as ServiceIcon,
  PostAdd as NewServiceIcon,
} from '@mui/icons-material';
import notif from '../assets/notif.png';

const drawerWidth = 280;

const SharedSidebar = ({ mobileOpen, onMobileClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const isAdmin = user?.is_superuser || user?.is_staff;
  const [openMenus, setOpenMenus] = useState({ stock: true, fournisseurs: false, categories: false });

  const toggleMenu = (id) => setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNav = (path) => {
    if (path) navigate(path);
    if (isMobile && onMobileClose) onMobileClose();
  };

  const menuGroups = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: isAdmin ? '/admin_dashboard' : '/dashboard',
    },
    {
      id: 'alertes',
      label: isAdmin ? 'Alert Rules' : 'Mes Alertes',
      icon: <FlashOnIcon />,
      path: isAdmin ? '/alert_rules' : '/alerts',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <NotificationsIcon />,
      path: '/notifications',
      badge: user?.unread_notifications || 0,
    },
    {
      id: 'stock',
      label: 'Produits',
      icon: <InventoryIcon />,
      children: [
        { id: 'stock-new',   label: 'Nouveau produit',      icon: <AddBoxIcon />,    path: '/stock/new' },
        { id: 'stock-list',  label: 'Liste',                icon: <ListIcon />,      path: '/stock' },
       
           ],
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: <CategoryIcon />,
      children: [
        { id: 'categories-new',   label: 'Nouvelle categorie', icon: <AddBoxIcon />, path: '/categories/new' },
        { id: 'categories-list',  label: 'Liste',              icon: <ListIcon />,   path: '/categories' },
      ],
    },
    {
      id: 'fournisseurs',
      label: 'fournisseurs',
      icon: <PeopleIcon />,
     children: [
        { id: 'fournisseur-new',   label: 'Nouveau fournisseur',      icon: <AddBoxIcon />,    path: '/fournisseur/new' },
        { id: 'fournisseur-list',  label: 'Liste',                icon: <ListIcon />,      path: '/fournisseur' },
      ],
    },
    {
      id: 'entrepots',
      label: 'Entrepôts',
      icon: <WarehouseIcon />,
      children: [
        { id: 'entrepot-new', label: 'Nouvel entrepôt', icon: <AddWarehouseIcon />, path: '/entrepots/new' },
        { id: 'entrepot-list',label: 'Liste',           icon: <ListIcon />,         path: '/entrepots' },
      ],
    },
    {
      id: 'modules',
      label: 'ERP Modules',
      icon: <StorageIcon />,
      path: '/modulesERP',
    },
    
    ...(isAdmin ? [
      { id: 'admin',   label: 'Admin Panel', icon: <AdminIcon />,     path: '/admin_panel' },
      { id: 'clients', label: 'Clients',     icon: <PersonAddIcon />, path: '/clients_requests' },
    ] : []),
    { id: 'history',      label: 'History',      icon: <CalendarIcon />, path: '/history' },
    { id: 'profile',      label: 'Profile',       icon: <PeopleIcon />,  path: '/profile' },
    { id: 'settings',     label: 'Paramètres',    icon: <SettingsIcon />,path: '/settings' },
    { id: 'deconnexion',  label: 'Déconnexion',   icon: <LogoutIcon />,  action: handleLogout },
  ];

  const isGroupActive = (group) => {
    if (group.path) return location.pathname === group.path;
    if (group.children) return group.children.some(c => location.pathname === c.path || location.pathname.startsWith(c.path + '/'));
    return false;
  };

  const isChildActive = (path) => location.pathname === path;

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'black', borderRight: '1px solid rgba(59,130,246,0.1)' }}>

      {/* Logo */}
      <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 50, height: 50, borderRadius: '50%', bgcolor: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
          <img src={notif} alt="Logo" width="80" height="80" />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem', color: 'white', lineHeight: 1 }}>
            SmartNotify
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
            {isAdmin ? 'ERP NOTIFICATIONS' : 'USER PANEL'}
          </Typography>
        </Box>
      </Box>

      {/* Menu */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 2, px: 2, scrollbarWidth: 'none', msOverflowStyle: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
        {menuGroups.map((group) => {
          const active = isGroupActive(group);
          const isOpen = openMenus[group.id];
          const hasChildren = Boolean(group.children?.length);

          return (
            <Box key={group.id} sx={{ mb: 0.5 }}>

              {/* Parent row */}
              <Box
                onClick={() => {
                  if (hasChildren) toggleMenu(group.id);
                  else if (group.action) group.action();
                  else handleNav(group.path);
                }}
                sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  px: 2, py: 1, borderRadius: 2, cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  bgcolor: active && !hasChildren ? 'rgba(59,130,246,0.15)' : 'transparent',
                  '&:hover': { bgcolor: active && !hasChildren ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.08)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {/* Icon */}
                  <Box sx={{
                    color: active ? '#3b82f6' : isOpen && hasChildren ? '#3b82f6' : '#64748b',
                    display: 'flex', alignItems: 'center',
                    '& svg': { fontSize: 20 },
                  }}>
                    {group.icon}
                  </Box>
                  {/* Label — same font as original */}
                  <Typography sx={{
                    fontSize: '0.9rem',
                    fontWeight: active || (hasChildren && isOpen) ? 600 : 400,
                    color: active ? '#60a5fa' : hasChildren && isOpen ? '#60a5fa' : '#94a3b8',
                  }}>
                    {group.label}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {/* Badge */}
                  {group.badge > 0 && (
                    <Box sx={{ bgcolor: '#ef4444', color: 'white', fontSize: '0.7rem', fontWeight: 600, px: 1, py: 0.25, borderRadius: 2, minWidth: 20, textAlign: 'center' }}>
                      {group.badge}
                    </Box>
                  )}
                  {/* Chevron */}
                  {hasChildren && (
                    <Box sx={{
                      color: '#64748b', display: 'flex',
                      transition: 'transform 0.2s ease',
                      transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                      '& svg': { fontSize: 18 },
                    }}>
                      <ExpandMoreIcon />
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Children dropdown */}
              {hasChildren && (
                <Collapse in={isOpen} timeout={200}>
                  <Box sx={{ ml: 2, pl: 1.5, borderLeft: '1px solid rgba(59,130,246,0.18)', mt: 0.3, mb: 0.5 }}>
                    {group.children.map((child) => {
                      const childActive = isChildActive(child.path);
                      return (
                        <Box
                          key={child.id}
                          onClick={() => handleNav(child.path)}
                          sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5,
                            px: 1.5, py: 0.7, mb: 0.2, borderRadius: '8px', cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            bgcolor: childActive ? 'rgba(59,130,246,0.12)' : 'transparent',
                            '&:hover': { bgcolor: childActive ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.05)' },
                          }}
                        >
                          <Box sx={{ color: childActive ? '#3b82f6' : '#64748b', display: 'flex', '& svg': { fontSize: 15 } }}>
                            {child.icon}
                          </Box>
                          {/* Child label — same size as original item text */}
                          <Typography sx={{
                            fontSize: '0.875rem',
                            fontWeight: childActive ? 600 : 400,
                            color: childActive ? '#60a5fa' : '#94a3b8',
                          }}>
                            {child.label}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Collapse>
              )}

            </Box>
          );
        })}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, m: 2, bgcolor: 'rgba(16,185,129,0.1)', borderRadius: 2, border: '1px solid rgba(16,185,129,0.2)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.5)', flexShrink: 0 }} />
          <Box>
            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600, display: 'block', fontSize: '0.85rem' }}>
              System Active
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
              {isAdmin ? 'Admin mode enabled' : 'User mode'}
            </Typography>
          </Box>
        </Box>
      </Box>

    </Box>
  );

  return (
    <>
      {/* Desktop */}
      {!isMobile && (
        <Box sx={{ width: drawerWidth, flexShrink: 0 }}>
          <Box sx={{
            width: drawerWidth, height: '100vh', position: 'fixed', left: 0, top: 0,
            bgcolor: 'black', borderRight: '1px solid rgba(59,130,246,0.1)',
            overflowY: 'auto', overflowX: 'hidden', zIndex: 1200,
            scrollbarWidth: 'none', msOverflowStyle: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}>
            {drawerContent}
          </Box>
        </Box>
      )}

      {/* Mobile */}
      {isMobile && (
        <Drawer variant="temporary" open={mobileOpen} onClose={onMobileClose}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth, boxSizing: 'border-box', border: 'none', bgcolor: 'black',
              scrollbarWidth: 'none', msOverflowStyle: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
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