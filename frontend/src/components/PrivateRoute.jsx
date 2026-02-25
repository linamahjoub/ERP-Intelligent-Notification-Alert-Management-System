import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';
import VerificationPending from '../pages/auth/VerificationPending';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  
  // Si l'utilisateur n'est pas authentifié
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Si l'utilisateur est authentifié mais inactif (en attente de vérification)
  if (!user.is_active) {
    return <VerificationPending />;
  }
  
  // Utilisateur authentifié et actif
  return children;
};

export default PrivateRoute;
