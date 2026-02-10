import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Container } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/profile';
import EditProfile from './pages/editProfile';
import ModulesERP from './pages/ModulesERP';
import Notifications from './pages/Notifications';
//import History from './pages/History';
//import AlertRules from './pages/AlertRules';
import Settings from './pages/Settings';

// IMPORTANT: Utilisez AdminPanel (qui vient de adminpaneau.jsx)
import AdminPanel from './pages/adminpaneau';
import AdminDashboard from './pages/adminDashboard';

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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Route racine */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* Routes protégées - Dashboard utilisateur */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />

        {/* Routes admin */}
        <Route path="/admin-panel" element={
          <PrivateRoute>
            <AdminPanel />
          </PrivateRoute>
        } />

        {/* Autres routes */}
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />

        <Route path="/edit-profile" element={
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

    
      {/* Dashboard admin (version graphiques) */}
  <Route path="/admin-dashboard" element={
    <PrivateRoute>
      <AdminDashboard />
    </PrivateRoute>
  } />

       

        <Route path="/settings" element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } />

        {/* Route de fallback */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Container>
  );
};

export default App;