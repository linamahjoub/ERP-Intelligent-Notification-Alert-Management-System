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
  BottomNavigation,
  BottomNavigationAction,
  Badge,
  Paper,
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
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import notif from '../assets/notif.png';

const desktopWidth = 280;
const collapsedWidth = 80;
const mobileWidth = 260;

const SharedSidebar = ({ mobileOpen, onMobileClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // État pour gérer le collapse du sidebar desktop
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const drawerWidth = isMobile ? mobileWidth : (sidebarCollapsed ? collapsedWidth : desktopWidth);

  const isAdmin = user?.is_superuser || user?.is_staff;
  const [openMenus, setOpenMenus] = useState({ stock: true, fournisseurs: false, categories: false });

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

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
      label: isAdmin ? 'Mes Alertes' : 'Mes Alertes',
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
      label: 'Stock',
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
      { id: 'Employes', label: 'Employés',     icon: <PersonAddIcon />, path: '/Employes_requests' },
    ] : []),
    { id: 'history',      label: 'Historique ',      icon: <CalendarIcon />, path: '/history' },
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

  // Bottom nav items for mobile (only main items)
  const bottomNavItems = isAdmin ? [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/admin_dashboard' },
    { label: 'Stock', icon: <InventoryIcon />, path: '/stock' },
    { label: 'Alertes', icon: <FlashOnIcon />, path: '/alert_rules' },
    { label: 'Notifications', icon: <NotificationsIcon />, path: '/notifications', badge: user?.unread_notifications || 0 },
    { label: 'Plus', icon: <MenuIcon />, openDrawer: true },
  ] : [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { label: 'Stock', icon: <InventoryIcon />, path: '/stock' },
    { label: 'Alertes', icon: <FlashOnIcon />, path: '/alerts' },
    { label: 'Notifications', icon: <NotificationsIcon />, path: '/notifications', badge: user?.unread_notifications || 0 },
    { label: 'Plus', icon: <MenuIcon />, openDrawer: true },
  ];

  const [bottomNavValue, setBottomNavValue] = useState(() => {
    const activeItem = bottomNavItems.findIndex(item => item.path && location.pathname.startsWith(item.path));
    return activeItem !== -1 ? activeItem : 0;
  });

  const [drawerOpenFromBottomNav, setDrawerOpenFromBottomNav] = useState(false);

  const handleBottomNavChange = (event, newValue) => {
    setBottomNavValue(newValue);
    const item = bottomNavItems[newValue];
    if (item.openDrawer) {
      // Toggle drawer
      setDrawerOpenFromBottomNav(!mobileOpen);
      if (onMobileClose) {
        onMobileClose(); // This will toggle the drawer state in parent
      }
    } else if (item.path) {
      navigate(item.path);
    } else if (item.action) {
      item.action();
    }
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'black', borderRight: '1px solid rgba(59,130,246,0.1)' }}>

      {/* Logo */}
      <Box sx={{ p: isMobile ? 1.5 : 2.5, borderBottom: '1px solid rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'flex-start', gap: isMobile ? 1 : 1.5 }}>
        <Box sx={{ width: isMobile ? 40 : (sidebarCollapsed ? 40 : 50), height: isMobile ? 40 : (sidebarCollapsed ? 40 : 50), borderRadius: '50%', bgcolor: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
          <img src={notif} alt="Logo" width={isMobile ? "60" : (sidebarCollapsed ? "60" : "80")} height={isMobile ? "60" : (sidebarCollapsed ? "60" : "80")} />
        </Box>
        {(!sidebarCollapsed || isMobile) && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: isMobile ? '1rem' : '1.25rem', color: 'white', lineHeight: 1 }}>
              SmartNotify
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: isMobile ? '0.6rem' : '0.7rem', letterSpacing: '0.5px' }}>
              {isAdmin ? 'ERP NOTIFICATIONS' : 'USER PANEL'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Menu */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: isMobile ? 1 : 2, px: isMobile ? 1.5 : 2, scrollbarWidth: 'none', msOverflowStyle: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
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
                  display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'space-between',
                  px: isMobile ? 1.5 : (sidebarCollapsed ? 1.5 : 2), py: isMobile ? 0.7 : 1, borderRadius: 2, cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  bgcolor: active && !hasChildren ? 'rgba(59,130,246,0.15)' : 'transparent',
                  '&:hover': { bgcolor: active && !hasChildren ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.08)' },
                  position: 'relative',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 1.5 }}>
                  {/* Icon */}
                  <Box sx={{
                    color: active ? '#3b82f6' : isOpen && hasChildren ? '#3b82f6' : '#64748b',
                    display: 'flex', alignItems: 'center',
                    '& svg': { fontSize: isMobile ? 18 : 20 },
                  }}>
                    {group.icon}
                  </Box>
                  {/* Label — same font as original */}
                  {(!sidebarCollapsed || isMobile) && (
                    <Typography sx={{
                      fontSize: isMobile ? '0.8rem' : '0.9rem',
                      fontWeight: active || (hasChildren && isOpen) ? 600 : 400,
                      color: active ? '#60a5fa' : hasChildren && isOpen ? '#60a5fa' : '#94a3b8',
                    }}>
                      {group.label}
                    </Typography>
                  )}
                </Box>

                {(!sidebarCollapsed || isMobile) && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {/* Badge */}
                    {group.badge > 0 && (
                      <Box sx={{ bgcolor: '#ef4444', color: 'white', fontSize: isMobile ? '0.6rem' : '0.7rem', fontWeight: 600, px: 0.75, py: 0.25, borderRadius: 2, minWidth: isMobile ? 16 : 20, textAlign: 'center' }}>
                        {group.badge}
                      </Box>
                    )}
                    {/* Chevron */}
                    {hasChildren && (
                      <Box sx={{
                        color: '#64748b', display: 'flex',
                        transition: 'transform 0.2s ease',
                        transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                        '& svg': { fontSize: isMobile ? 16 : 18 },
                      }}>
                        <ExpandMoreIcon />
                      </Box>
                    )}
                  </Box>
                )}
                {/* Tooltip for collapsed state */}
                {sidebarCollapsed && !isMobile && group.badge > 0 && (
                  <Box sx={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, bgcolor: '#ef4444', borderRadius: '50%', boxShadow: '0 0 6px rgba(239,68,68,0.6)' }} />
                )}
              </Box>

              {/* Children dropdown */}
              {hasChildren && !sidebarCollapsed && (
                <Collapse in={isOpen} timeout={200}>
                  <Box sx={{ ml: isMobile ? 1 : 2, pl: isMobile ? 1 : 1.5, borderLeft: '1px solid rgba(59,130,246,0.18)', mt: 0.3, mb: 0.5 }}>
                    {group.children.map((child) => {
                      const childActive = isChildActive(child.path);
                      return (
                        <Box
                          key={child.id}
                          onClick={() => handleNav(child.path)}
                          sx={{
                            display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 1.5,
                            px: isMobile ? 1 : 1.5, py: isMobile ? 0.5 : 0.7, mb: 0.2, borderRadius: '8px', cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            bgcolor: childActive ? 'rgba(59,130,246,0.12)' : 'transparent',
                            '&:hover': { bgcolor: childActive ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.05)' },
                          }}
                        >
                          <Box sx={{ color: childActive ? '#3b82f6' : '#64748b', display: 'flex', '& svg': { fontSize: isMobile ? 13 : 15 } }}>
                            {child.icon}
                          </Box>
                          {/* Child label — same size as original item text */}
                          <Typography sx={{
                            fontSize: isMobile ? '0.75rem' : '0.875rem',
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
      {(!sidebarCollapsed || isMobile) && (
        <Box sx={{ p: isMobile ? 1.5 : 2, m: isMobile ? 1 : 2, bgcolor: 'rgba(16,185,129,0.1)', borderRadius: 2, border: '1px solid rgba(16,185,129,0.2)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 0.75 : 1 }}>
            <Box sx={{ width: isMobile ? 6 : 8, height: isMobile ? 6 : 8, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.5)', flexShrink: 0 }} />
            <Box>
              <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600, display: 'block', fontSize: isMobile ? '0.7rem' : '0.85rem' }}>
                System Active
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
                {isAdmin ? 'Admin mode enabled' : 'User mode'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
      {sidebarCollapsed && !isMobile && (
        <Box sx={{ p: 2, m: 2, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.5)' }} />
        </Box>
      )}

    </Box>
  );

  return (
    <>
      {/* Desktop */}
      {!isMobile && (
        <Box sx={{ width: drawerWidth, flexShrink: 0, position: 'relative' }}>
          <Box sx={{
            width: drawerWidth, height: '100vh', position: 'fixed', left: 0, top: 0,
            bgcolor: 'black', borderRight: '1px solid rgba(59,130,246,0.1)',
            overflowY: 'auto', overflowX: 'hidden', zIndex: 1200,
            transition: 'width 0.3s ease',
            scrollbarWidth: 'none', msOverflowStyle: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}>
            {drawerContent}
          </Box>
          
          {/* Toggle button */}
          <Box
            onClick={toggleSidebar}
            sx={{
              position: 'fixed',
              left: sidebarCollapsed ? collapsedWidth - 20 : drawerWidth - 20,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: '#3b82f6',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 1300,
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#2563eb',
                boxShadow: '0 6px 16px rgba(59, 130, 246, 0.6)',
                transform: 'translateY(-50%) scale(1.1)',
              },
            }}
          >
            {sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </Box>
        </Box>
      )}

      {/* Mobile Drawer (for secondary items) */}
      {isMobile && (
        <Drawer variant="temporary" open={mobileOpen} onClose={onMobileClose}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth, 
              boxSizing: 'border-box', 
              border: 'none', 
              bgcolor: 'black',
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1300,
            bgcolor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(59, 130, 246, 0.2)',
            boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.3)',
          }}
          elevation={3}
        >
          <BottomNavigation
            value={bottomNavValue}
            onChange={handleBottomNavChange}
            showLabels
            sx={{
              bgcolor: 'transparent',
              height: 65,
              '& .MuiBottomNavigationAction-root': {
                color: '#64748b',
                minWidth: 'auto',
                padding: '6px 12px',
                '&.Mui-selected': {
                  color: '#3b82f6',
                  '& .MuiBottomNavigationAction-label': {
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  },
                },
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.65rem',
                  marginTop: '4px',
                },
              },
            }}
          >
            {bottomNavItems.map((item, index) => (
              <BottomNavigationAction
                key={index}
                label={item.label}
                icon={
                  item.badge > 0 ? (
                    <Badge
                      badgeContent={item.badge}
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.6rem',
                          height: 16,
                          minWidth: 16,
                          padding: '0 4px',
                        },
                      }}
                    >
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )
                }
                sx={{
                  '& .MuiSvgIcon-root': {
                    fontSize: 24,
                  },
                }}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </>
  );
};

export default SharedSidebar;