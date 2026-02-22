import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Container } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import VerificationPending from './pages/VerificationPending';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ChangePassword from './pages/ChangePassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/profile';
import EditProfile from './pages/editProfile';
import ModulesERP from './pages/ModulesERP';
import Notifications from './pages/Notifications';
import DashboardStock from './pages/Stock';
import NewAlert from './pages/NewAlert';
import Fournisseur from './pages/fournisseur';
import Categories from './pages/categories';

//import History from './pages/History';
import AlertRules from './pages/AlertRules';
import EditAlert from './pages/EditAlert';
import Settings from './pages/Settings';
import SharedSidebar from './components/SharedSidebar';
// IMPORTANT: Utilisez AdminPanel (qui vient de adminpaneau.jsx)
import AdminPanel from './pages/adminpaneau';
import AdminDashboard from './pages/adminDashboard';
import ClientsRequests from './pages/clients_requests';
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const DebugApp = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    console.log(' DEBUG APP - User:', user);
    if (user) {
      console.log('is_superuser:', user.is_superuser);
      console.log('is_primary_admin:', user.is_primary_admin);
      console.log('is_staff:', user.is_staff);
    }
  }, [user]);
  
  return null;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <DebugApp />
        <Router>
          <InnerRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si l'utilisateur est inactif, aller à la page d'attente
  if (!user.is_active) {
    return <Navigate to="/verification-pending" replace />;
  }

  const isAdmin = user.is_superuser || user.is_staff;
  return <Navigate to={isAdmin ? "/admin_dashboard" : "/dashboard"} replace />;
};

const RequireAdmin = ({ children }) => {
  const { user } = useAuth();
  const isAdmin = user?.is_superuser || user?.is_staff;

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};


const RequireUser = ({ children }) => {
  const { user } = useAuth();
  const isAdmin = user?.is_superuser || user?.is_staff;

  if (isAdmin) {
    return <Navigate to="/admin_dashboard" replace />;
  }

  return children;
};

const InnerRoutes = () => {
  const location = useLocation();
  const authPaths = ['/login', '/register', '/forgot-password'];
  const isAuthPage = authPaths.includes(location.pathname);

  return (
    <Container
      maxWidth={isAuthPage ? false : 'xl'}
      disableGutters={isAuthPage}
      sx={isAuthPage ? { p: 0, mt: 0, mb: 0 } : { mt: 4, mb: 4 }}
    >
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verification-pending" element={<VerificationPending />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
        <Route path="/change-password" element={
          <PrivateRoute>
            <ChangePassword />
          </PrivateRoute>
        } />
        
        {/* Route racine */}
        <Route path="/" element={<RoleBasedRedirect />} />

        {/* Route en attente de vérification */}
        <Route path="/verification-pending" element={<VerificationPending />} />

        {/* Routes protégées - Dashboard utilisateur */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <RequireUser>
              <Dashboard />
            </RequireUser>
          </PrivateRoute>
        } />
        {/* Routes admin */}
        <Route path="/admin_panel" element={
          <PrivateRoute>
            <RequireAdmin>
              <AdminPanel />
            </RequireAdmin>
          </PrivateRoute>
        } />

        {/* Autres routes */}
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />

        <Route path="/edit_profile" element={
          <PrivateRoute>
            <EditProfile />
          </PrivateRoute>
        } />
  
        <Route path="/modulesERP" element={
          <PrivateRoute>
            <ModulesERP />
          </PrivateRoute>
        } />

        <Route path="/notifications" element={
          <PrivateRoute>
            <Notifications />
          </PrivateRoute>
        } />

        {/* Route pour le dashboard stock */}
        <Route path="/stock" element={
          <PrivateRoute>
            <DashboardStock />
          </PrivateRoute>
        } />
        <Route path="/stock/new" element={
          <PrivateRoute>
            <DashboardStock />
          </PrivateRoute>
        } />
        {/* Route pour le dashboard stock */}
        <Route path="/fournisseur" element={
          <PrivateRoute>
            <Fournisseur />
          </PrivateRoute>
        } />
          <Route path="/fournisseur/new" element={
          <PrivateRoute>
            <Fournisseur />
          </PrivateRoute>
        } />
        <Route path="/categories" element={
          <PrivateRoute>
            <Categories />
          </PrivateRoute>
        } />
        <Route path="/categories/new" element={
          <PrivateRoute>
            <Categories />
          </PrivateRoute>
        } />
        {/* Route pour créer une nouvelle alerte */}
        <Route path="/new-alert" element={
          <PrivateRoute>
            <NewAlert />
          </PrivateRoute>
        } />

        {/* Route pour éditer une alerte */}
        <Route path="/edit-alert/:id" element={
          <PrivateRoute>
            <EditAlert />
          </PrivateRoute>
        } />

        {/* Routes clients */}
        <Route path="/clients_requests" element={
          <PrivateRoute>
            <RequireAdmin>
              <ClientsRequests />
            </RequireAdmin>
          </PrivateRoute>
        } />

        {/* Route pour les alertes - fonctionne pour admin et utilisateurs */}
        {/* Les alertes affichées varient selon le rôle de l'utilisateur */}
        <Route path="/alerts" element={
          <PrivateRoute>
            <AlertRules />
          </PrivateRoute>
        } />

        {/* Alias pour la compatibilité */}
        <Route path="/alert_rules" element={
          <PrivateRoute>
            <AlertRules />
          </PrivateRoute>
        } />

        {/* Dashboard admin (version graphiques) */}
        <Route path="/admin_dashboard" element={
          <PrivateRoute>
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          </PrivateRoute>
        } />

       

        <Route path="/settings" element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } />

        {/* Route de fallback */}
        <Route path="*" element={<RoleBasedRedirect />} />
      </Routes>
    </Container>
  );
};

export default App;