import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  console.log('🔐 PRIVATEROUTE DEBUG - Start');
  console.log('🔐 PRIVATEROUTE - User:', user);
  console.log('🔐 PRIVATEROUTE - Loading:', loading);
  console.log('🔐 PRIVATEROUTE - User type:', typeof user);
  console.log('🔐 PRIVATEROUTE - User keys:', user ? Object.keys(user) : 'null');
  
  if (loading) {
    console.log('⏳ PRIVATEROUTE: En cours de chargement...');
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  
  console.log('🔐 PRIVATEROUTE: Chargement terminé');
  console.log('🔐 PRIVATEROUTE: User après chargement:', user);
  
  if (!user) {
    console.log('❌ PRIVATEROUTE: Utilisateur non authentifié, redirection vers /login');
    return <Navigate to="/login" />;
  }
  
  console.log('✅ PRIVATEROUTE: Utilisateur authentifié, rendu des enfants');
  console.log('✅ PRIVATEROUTE: User details:', {
    email: user.email,
    is_superuser: user.is_superuser,
    is_staff: user.is_staff
  });
  
  return children;
};

export default PrivateRoute;
