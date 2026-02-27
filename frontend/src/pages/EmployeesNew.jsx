import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Menu as MenuIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SharedSidebar from '../components/SharedSidebar';

const EmployeesNew = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.is_superuser || user?.is_staff || user?.is_primary_admin;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [employeeData, setEmployeeData] = useState({
    email: '',
    username: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    role: 'employe',
    company: '',
    authorized_pages: [],
  });

  const availableRoles = [
    { value: 'employe', label: 'Employe', roleValue: 'employe', is_staff: false, is_superuser: false },
    { value: 'responsable_stock', label: 'Responsable stock', roleValue: 'responsable_stock', is_staff: false, is_superuser: false },
    { value: 'commercial', label: 'Commercial', roleValue: 'commercial', is_staff: false, is_superuser: false },
    { value: 'achats', label: 'Achats', roleValue: 'achats', is_staff: false, is_superuser: false },
    { value: 'admin', label: 'Administrateur', roleValue: 'employe', is_staff: true, is_superuser: false }
  ];

  const availablePages = [
    'Dashboard',
    'Stock',
    'Fournisseurs',
    'Catégories',
    'Entrepôts',
    'Alertes',
    'Notifications',
    'Rapports',
    'Paramètres',
  ];

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleAddEmployee = async () => {
    if (!employeeData.email || !employeeData.username || !employeeData.password) {
      setErrorMessage('Email, nom d\'utilisateur et mot de passe sont requis');
      return;
    }

    if (employeeData.password !== employeeData.confirm_password) {
      setErrorMessage('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const token = localStorage.getItem('access_token');
      const selectedRole = availableRoles.find((r) => r.value === employeeData.role);

      const userData = {
        email: employeeData.email,
        username: employeeData.username,
        password: employeeData.password,
        first_name: employeeData.first_name,
        last_name: employeeData.last_name,
        phone_number: employeeData.phone_number,
        company: employeeData.company,
        role: selectedRole?.roleValue || 'employe',
        authorized_pages: employeeData.authorized_pages,
        is_staff: selectedRole?.is_staff || false,
        is_superuser: selectedRole?.is_superuser || false,
        is_active: true,
      };

      const response = await fetch('http://localhost:8000/api/admin/users/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessageFromApi = () => {
          if (!errorData) {
            return null;
          }
          if (typeof errorData === 'string') {
            return errorData;
          }
          if (errorData.detail) {
            return errorData.detail;
          }
          if (errorData.non_field_errors && errorData.non_field_errors.length > 0) {
            return errorData.non_field_errors[0];
          }
          const fieldMessages = Object.values(errorData)
            .map((value) => {
              if (Array.isArray(value) && value.length > 0) {
                return value[0];
              }
              if (typeof value === 'string') {
                return value;
              }
              return null;
            })
            .filter(Boolean);
          return fieldMessages[0] || null;
        };

        setErrorMessage(errorMessageFromApi() || 'Erreur lors de l\'ajout de l\'employé');
        return;
      }

      setSuccessMessage('Employé ajouté avec succès');
      setEmployeeData({
        email: '',
        username: '',
        password: '',
        confirm_password: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        role: 'employe',
        company: '',
        authorized_pages: [],
      });
    } catch (error) {
      setErrorMessage('Erreur réseau lors de l\'ajout de l\'employé');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'black' }}>
      <SharedSidebar mobileOpen={mobileOpen} onMobileClose={handleDrawerToggle} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: isMobile ? '100%' : 'calc(100% - 280px)',
          minHeight: '100vh',
          bgcolor: 'black',
        }}
      >
        {isMobile && (
          <AppBar position="sticky" sx={{ bgcolor: 'black', borderBottom: '1px solid rgba(59,130,246,0.1)' }}>
            <Toolbar>
              <IconButton edge="start" color="inherit" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={{ color: 'white' }}>
                Nouvel employé
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        <Box sx={{ p: 3 }}>
          <Container maxWidth="md">
            {!isAdmin ? (
              <Paper
                elevation={3}
                sx={{ p: 4, mt: 4, bgcolor: 'rgba(30,41,59,0.5)', border: '1px solid rgba(59,130,246,0.1)' }}
              >
                <Typography variant="h4" sx={{ color: 'white', mb: 2 }}>
                  Accès refusé
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Cette section est réservée aux administrateurs.
                </Typography>
              </Paper>
            ) : (
              <Paper
                elevation={3}
                sx={{ p: 4, mt: 4, bgcolor: 'rgba(30,41,59,0.5)', border: '1px solid rgba(59,130,246,0.1)' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <PersonAddIcon sx={{ color: '#3b82f6', fontSize: 32 }} />
                  <Box>
                    <Typography variant="h4" sx={{ color: 'white' }}>
                      Ajouter un nouvel employé
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      Créez un compte employé et définissez ses permissions
                    </Typography>
                  </Box>
                </Box>

                {successMessage && (
                  <Alert
                    severity="success"
                    sx={{ mb: 3, bgcolor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}
                  >
                    {successMessage}
                  </Alert>
                )}
                {errorMessage && (
                  <Alert
                    severity="error"
                    sx={{ mb: 3, bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
                  >
                    {errorMessage}
                  </Alert>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <TextField
                      label="Email"
                      type="email"
                      value={employeeData.email}
                      onChange={(e) => setEmployeeData({ ...employeeData, email: e.target.value })}
                      fullWidth
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: '#94a3b8',
                          '& fieldset': { borderColor: 'rgba(59,130,246,0.2)' },
                          '&:hover fieldset': { borderColor: 'rgba(59,130,246,0.4)' },
                          '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                          bgcolor: 'rgba(59,130,246,0.05)',
                          borderRadius: '10px',
                        },
                        '& .MuiInputLabel-root': { color: '#64748b' },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
                      }}
                    />

                    <TextField
                      label="Nom d'utilisateur"
                      value={employeeData.username}
                      onChange={(e) => setEmployeeData({ ...employeeData, username: e.target.value })}
                      fullWidth
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: '#94a3b8',
                          '& fieldset': { borderColor: 'rgba(59,130,246,0.2)' },
                          '&:hover fieldset': { borderColor: 'rgba(59,130,246,0.4)' },
                          '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                          bgcolor: 'rgba(59,130,246,0.05)',
                          borderRadius: '10px',
                        },
                        '& .MuiInputLabel-root': { color: '#64748b' },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <TextField
                      label="Prénom"
                      value={employeeData.first_name}
                      onChange={(e) => setEmployeeData({ ...employeeData, first_name: e.target.value })}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: '#94a3b8',
                          '& fieldset': { borderColor: 'rgba(59,130,246,0.2)' },
                          '&:hover fieldset': { borderColor: 'rgba(59,130,246,0.4)' },
                          '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                          bgcolor: 'rgba(59,130,246,0.05)',
                          borderRadius: '10px',
                        },
                        '& .MuiInputLabel-root': { color: '#64748b' },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
                      }}
                    />

                    <TextField
                      label="Nom"
                      value={employeeData.last_name}
                      onChange={(e) => setEmployeeData({ ...employeeData, last_name: e.target.value })}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: '#94a3b8',
                          '& fieldset': { borderColor: 'rgba(59,130,246,0.2)' },
                          '&:hover fieldset': { borderColor: 'rgba(59,130,246,0.4)' },
                          '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                          bgcolor: 'rgba(59,130,246,0.05)',
                          borderRadius: '10px',
                        },
                        '& .MuiInputLabel-root': { color: '#64748b' },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <TextField
                      label="Téléphone"
                      value={employeeData.phone_number}
                      onChange={(e) => setEmployeeData({ ...employeeData, phone_number: e.target.value })}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: '#94a3b8',
                          '& fieldset': { borderColor: 'rgba(59,130,246,0.2)' },
                          '&:hover fieldset': { borderColor: 'rgba(59,130,246,0.4)' },
                          '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                          bgcolor: 'rgba(59,130,246,0.05)',
                          borderRadius: '10px',
                        },
                        '& .MuiInputLabel-root': { color: '#64748b' },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
                      }}
                    />

                    <TextField
                      label="Entreprise"
                      value={employeeData.company}
                      onChange={(e) => setEmployeeData({ ...employeeData, company: e.target.value })}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: '#94a3b8',
                          '& fieldset': { borderColor: 'rgba(59,130,246,0.2)' },
                          '&:hover fieldset': { borderColor: 'rgba(59,130,246,0.4)' },
                          '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                          bgcolor: 'rgba(59,130,246,0.05)',
                          borderRadius: '10px',
                        },
                        '& .MuiInputLabel-root': { color: '#64748b' },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
                      }}
                    />
                  </Box>

                  <TextField
                    label="Mot de passe"
                    type="password"
                    value={employeeData.password}
                    onChange={(e) => setEmployeeData({ ...employeeData, password: e.target.value })}
                    fullWidth
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#94a3b8',
                        '& fieldset': { borderColor: 'rgba(59,130,246,0.2)' },
                        '&:hover fieldset': { borderColor: 'rgba(59,130,246,0.4)' },
                        '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                        bgcolor: 'rgba(59,130,246,0.05)',
                        borderRadius: '10px',
                      },
                      '& .MuiInputLabel-root': { color: '#64748b' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
                    }}
                  />

                  <TextField
                    label="Confirmer mot de passe"
                    type="password"
                    value={employeeData.confirm_password}
                    onChange={(e) => setEmployeeData({ ...employeeData, confirm_password: e.target.value })}
                    fullWidth
                    required
                    error={employeeData.password && employeeData.confirm_password && employeeData.password !== employeeData.confirm_password}
                    helperText={
                      employeeData.password && employeeData.confirm_password && employeeData.password !== employeeData.confirm_password
                        ? 'Les mots de passe ne correspondent pas'
                        : ''
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#94a3b8',
                        '& fieldset': { borderColor: employeeData.password && employeeData.confirm_password && employeeData.password !== employeeData.confirm_password ? 'rgba(239,68,68,0.5)' : 'rgba(59,130,246,0.2)' },
                        '&:hover fieldset': { borderColor: 'rgba(59,130,246,0.4)' },
                        '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                        bgcolor: 'rgba(59,130,246,0.05)',
                        borderRadius: '10px',
                      },
                      '& .MuiInputLabel-root': { color: '#64748b' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
                      '& .MuiFormHelperText-root': { color: '#ef4444' },
                    }}
                  />

                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#64748b', '&.Mui-focused': { color: '#3b82f6' } }}>Rôle</InputLabel>
                    <Select
                      value={employeeData.role}
                      onChange={(e) => setEmployeeData({ ...employeeData, role: e.target.value })}
                      label="Rôle"
                      sx={{
                        color: '#94a3b8',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(59,130,246,0.2)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(59,130,246,0.4)' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                        bgcolor: 'rgba(59,130,246,0.05)',
                        borderRadius: '10px',
                      }}
                    >
                      {availableRoles.map((role) => (
                        <MenuItem key={role.value} value={role.value}>
                          {role.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#64748b', '&.Mui-focused': { color: '#3b82f6' } }}>Pages autorisées</InputLabel>
                    <Select
                      multiple
                      value={employeeData.authorized_pages}
                      onChange={(e) => setEmployeeData({ ...employeeData, authorized_pages: e.target.value })}
                      input={<OutlinedInput label="Pages autorisées" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} sx={{ bgcolor: '#3b82f6', color: 'white' }} />
                          ))}
                        </Box>
                      )}
                      sx={{
                        color: '#94a3b8',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(59,130,246,0.2)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(59,130,246,0.4)' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                        bgcolor: 'rgba(59,130,246,0.05)',
                        borderRadius: '10px',
                      }}
                    >
                      {availablePages.map((page) => (
                        <MenuItem key={page} value={page}>
                          <Checkbox checked={employeeData.authorized_pages.indexOf(page) > -1} />
                          <ListItemText primary={page} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      onClick={() => navigate('/settings/preferences')}
                      variant="outlined"
                      sx={{
                        borderColor: 'rgba(59,130,246,0.5)',
                        color: '#94a3b8',
                        fontWeight: 600,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        '&:hover': { borderColor: '#3b82f6', color: '#3b82f6' },
                      }}
                    >
                      Retour
                    </Button>

                    <Button
                      onClick={handleAddEmployee}
                      disabled={loading}
                      variant="contained"
                      sx={{
                        bgcolor: '#3b82f6',
                        color: 'white',
                        fontWeight: 600,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                        '&:hover': { bgcolor: '#2563eb' },
                        '&:disabled': { opacity: 0.6 },
                      }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Ajouter l\'employé'}
                    </Button>
                  </Box>
                </Box>
              </Paper>
            )}
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default EmployeesNew;
