import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => {
    return localStorage.getItem('access_token');
  });

  useEffect(() => {
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authToken) => {
    try {
      const response = await axios.get('http://localhost:8000/api/auth/user/', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const userData = {
        id: response.data.id,
        email: response.data.email,
        username: response.data.username,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        phone_number: response.data.phone_number || '',
        role: response.data.role || '',
        company: response.data.company || '',
        profile_picture: response.data.profile_picture || null,
        is_active: response.data.is_active,
        is_superuser: response.data.is_superuser || false,
        is_staff: response.data.is_staff || false,
        is_primary_admin: response.data.is_primary_admin || false,
        date_joined: response.data.date_joined,
        last_login: response.data.last_login,
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error fetching profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login/', {
        email,
        password
      }, {
        withCredentials: true
      });
      
      const { access, refresh, user: apiUserData } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setToken(access);
      
      const fullUserData = {
        id: apiUserData.id,
        email: apiUserData.email,
        username: apiUserData.username,
        first_name: apiUserData.first_name,
        last_name: apiUserData.last_name,
        phone_number: apiUserData.phone_number || '',
        role: apiUserData.role || '',
        company: apiUserData.company || '',
        profile_picture: apiUserData.profile_picture || null,
        is_active: apiUserData.is_active,
        is_superuser: apiUserData.is_superuser || false,
        is_staff: apiUserData.is_staff || false,
        is_primary_admin: apiUserData.is_primary_admin || false,
        date_joined: apiUserData.date_joined,
        last_login: apiUserData.last_login,
      };
      
      setUser(fullUserData);
      localStorage.setItem('user', JSON.stringify(fullUserData));
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      
      let errorMessage = 'Login failed';
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          if (error.response.data.error) {
            errorMessage = error.response.data.error;
          } else if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          } else {
            // Extraire le premier message d'erreur
            const errors = Object.values(error.response.data).flat();
            errorMessage = errors[0] || errorMessage;
          }
        } else {
          errorMessage = error.response.data;
        }
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const logout = async () => {
    try {
      const refresh_token = localStorage.getItem('refresh_token');
      // Appeler l'API de déconnexion pour nettoyer la session
      await axios.post('http://localhost:8000/api/auth/logout/', 
        { refresh_token },
        { 
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Nettoyer le localStorage dans tous les cas
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/register/', userData);
      
      const { access, refresh, user: apiUserData } = response.data;
      
      // Sauvegarder les tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setToken(access);
      
      // Sauvegarder les données utilisateur (avec is_active = false)
      const fullUserData = {
        id: apiUserData.id,
        email: apiUserData.email,
        username: apiUserData.username,
        first_name: apiUserData.first_name,
        last_name: apiUserData.last_name,
        phone_number: apiUserData.phone_number || '',
        role: apiUserData.role || '',
        company: apiUserData.company || '',
        profile_picture: apiUserData.profile_picture || null,
        is_active: apiUserData.is_active,
        is_superuser: apiUserData.is_superuser || false,
        is_staff: apiUserData.is_staff || false,
        is_primary_admin: apiUserData.is_primary_admin || false,
        date_joined: apiUserData.date_joined,
        last_login: apiUserData.last_login,
      };
      
      setUser(fullUserData);
      localStorage.setItem('user', JSON.stringify(fullUserData));
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration error:', error.response?.data || error);
      
      let errorMessage = 'Registration failed';
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          // Extraire tous les messages d'erreur
          const errors = [];
          for (const key in error.response.data) {
            if (Array.isArray(error.response.data[key])) {
              errors.push(`${key}: ${error.response.data[key].join(', ')}`);
            } else {
              errors.push(`${key}: ${error.response.data[key]}`);
            }
          }
          errorMessage = errors.join(' | ');
        } else {
          errorMessage = error.response.data;
        }
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const updateProfile = async (formData) => {
    if (!token) {
      return { success: false, error: 'No authentication token found' };
    }
    
    try {
      const response = await axios.put(
        'http://localhost:8000/api/auth/user/',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
      
      const payloadUser = response.data.user || response.data;
      const updatedUser = {
        ...user,
        ...payloadUser
      };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.detail || 'Failed to update profile' 
      };
    }
  };

  const changePassword = async (oldPassword, newPassword, newPassword2) => {
    if (!token) {
      return { success: false, error: 'No authentication token found' };
    }

    try {
      const response = await axios.post(
        'http://localhost:8000/api/auth/change-password/',
        {
          old_password: oldPassword,
          new_password: newPassword,
          new_password2: newPassword2,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error ||
        error.response?.data?.detail ||
        error.response?.data?.old_password ||
        error.response?.data?.new_password ||
        error.response?.data?.new_password2 ||
        'Failed to change password';

      return { success: false, error: errorMessage };
    }
  };

  const isAdmin = () => {
    if (!user) return false;
    return user.is_superuser || user.is_staff;
  };

  // Nouvelles fonctions pour la sécurité
  const checkEmailExists = async (email) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/auth/check-email/?email=${encodeURIComponent(email)}`
      );
      return response.data;
    } catch (error) {
      console.error('Error checking email:', error);
      return { exists: false, valid: false };
    }
  };

  const checkPasswordStrength = async (password) => {
    try {
      const response = await axios.post(
        'http://localhost:8000/api/auth/check-password-strength/',
        { password }
      );
      return response.data;
    } catch (error) {
      console.error('Error checking password strength:', error);
      return null;
    }
  };

  const generatePassword = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/auth/generate-password/');
      return response.data.password;
    } catch (error) {
      console.error('Error generating password:', error);
      return null;
    }
  };

  const refreshUser = async () => {
    if (!token) {
      return { success: false, error: 'No authentication token' };
    }
    
    try {
      const response = await axios.get('http://localhost:8000/api/auth/user/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const updatedUser = {
        id: response.data.id,
        email: response.data.email,
        username: response.data.username,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        phone_number: response.data.phone_number || '',
        role: response.data.role || '',
        company: response.data.company || '',
        profile_picture: response.data.profile_picture || null,
        is_active: response.data.is_active,
        is_superuser: response.data.is_superuser || false,
        is_staff: response.data.is_staff || false,
        is_primary_admin: response.data.is_primary_admin || false,
        date_joined: response.data.date_joined,
        last_login: response.data.last_login,
      };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true, data: updatedUser };
    } catch (error) {
      console.error('Error refreshing user:', error);
      return { success: false, error: 'Failed to refresh user' };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    isAdmin,
    checkEmailExists,
    checkPasswordStrength,
    generatePassword,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};