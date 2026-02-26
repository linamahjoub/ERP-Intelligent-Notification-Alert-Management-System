import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, useTheme, useMediaQuery, IconButton, AppBar, Toolbar, TextField, Button, Alert, CircularProgress, InputAdornment, Select, MenuItem, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip as MuiChip } from '@mui/material';
import { Menu as MenuIcon, Lock as LockIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon, PersonAdd as PersonAddIcon, Edit as EditIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SharedSidebar from '../components/SharedSidebar';
import PillNav from '../components/PillNav';
import notif from '../assets/notif.png';

const Settings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const isAdmin = user?.is_superuser || user?.is_staff || user?.is_primary_admin;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('/settings/profile');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [accountInfo, setAccountInfo] = useState({
    company: '',
    currency: '',
    vatRate: '',
    stockAlertThreshold: ''
  });

  // État pour le formulaire d'ajout d'employé
  const [employeeData, setEmployeeData] = useState({
    email: '',
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    role: 'user',
    company: '',
    authorized_pages: []
  });

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const usersList = Array.isArray(users) ? users : [];

  // Liste des rôles disponibles
  const availableRoles = [
    { value: 'user', label: 'Utilisateur', is_staff: false, is_superuser: false },
    { value: 'manager', label: 'Manager', is_staff: true, is_superuser: false },
    { value: 'admin', label: 'Administrateur', is_staff: true, is_superuser: false }
  ];

  // Charger les utilisateurs
  useEffect(() => {
    if (activeSection === '/settings/preferences') {
      if (!isAdmin) {
        setErrorMessage('Accès réservé aux administrateurs');
        setSuccessMessage('');
        setActiveSection('/settings/profile');
        return;
      }
      fetchUsers();
    }
  }, [activeSection, isAdmin]);

  useEffect(() => {
    const savedCurrency = localStorage.getItem('settings_currency') || '';
    const savedVatRate = localStorage.getItem('settings_vat_rate') || '';
    const savedThreshold = localStorage.getItem('settings_stock_threshold') || '';

    setAccountInfo((prev) => ({
      ...prev,
      currency: savedCurrency,
      vatRate: savedVatRate,
      stockAlertThreshold: savedThreshold
    }));
  }, []);

  useEffect(() => {
    if (user) {
      setAccountInfo((prev) => ({
        ...prev,
        company: user.company || ''
      }));
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      console.log('Token:', token);
      console.log('Fetching users from: http://localhost:8000/api/admin/users/');
      
      const response = await fetch('http://localhost:8000/api/admin/users/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Users loaded:', data);
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (Array.isArray(data?.results)) {
          setUsers(data.results);
        } else if (Array.isArray(data?.users)) {
          setUsers(data.users);
        } else {
          setUsers([]);
        }
      } else {
        const errorData = await response.json();
        console.error('Erreur API:', response.status, errorData);
        setErrorMessage(`Erreur lors du chargement des utilisateurs: ${response.status} - ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      setErrorMessage(`Erreur réseau: ${error.message}`);
    }
  };

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const settingsItems = [
    { label: 'Général', href: '/settings/profile' },
    { label: 'Catégories', href: '/categories' },
    { label: 'Notifications', href: '/notifications' },
    ...(isAdmin ? [{ label: 'Utilisateur', href: '/settings/preferences' }] : []),
    { label: 'Sécurité', href: '/settings/security' }
  ];

  const handleSectionChange = (href) => {
    // Naviguer vers les pages externes
    if (href === '/notifications' || href === '/categories') {
      navigate(href);
      return;
    }

    if (href === '/settings/preferences' && !isAdmin) {
      setErrorMessage('Accès réservé aux administrateurs');
      setSuccessMessage('');
      return;
    }
    
    // Gérer les sections internes de Settings
    setActiveSection(href);
    setSuccessMessage('');
    setErrorMessage('');
    setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    setEmployeeData({
      email: '',
      username: '',
      password: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      role: 'user',
      company: '',
      authorized_pages: []
    });
  };

  const handleUpdateUserRole = async () => {
    if (!selectedUser) {
      setErrorMessage('Veuillez sélectionner un utilisateur');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const token = localStorage.getItem('access_token');
      
      // Trouver le rôle sélectionné pour récupérer is_staff et is_superuser
      const selectedRole = availableRoles.find(r => r.value === employeeData.role);
      
      const updateData = {
        role: employeeData.role,
        is_staff: selectedRole?.is_staff || false,
        is_superuser: selectedRole?.is_superuser || false
      };
      
      console.log('Updating user role:', updateData);
      
      const response = await fetch(`http://localhost:8000/api/admin/users/${selectedUser}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur update rôle:', errorData);
        setErrorMessage('Erreur lors de la mise à jour du rôle: ' + JSON.stringify(errorData));
        return;
      }

      const result = await response.json();
      console.log('User role updated:', result);
      setSuccessMessage('Rôle mis à jour avec succès');
      fetchUsers();
    } catch (error) {
      console.error('Erreur réseau:', error);
      setErrorMessage('Erreur réseau lors de la mise à jour: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      setErrorMessage('Tous les champs sont requis');
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setErrorMessage('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.new_password.length < 8) {
      setErrorMessage('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/auth/change-password/', {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          old_password: passwordData.current_password,
          new_password: passwordData.new_password,
          new_password2: passwordData.confirm_password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur changement mot de passe:', errorData);
        
        if (errorData.old_password) {
          setErrorMessage(errorData.old_password[0] || errorData.old_password);
        } else if (errorData.new_password) {
          setErrorMessage(errorData.new_password[0] || errorData.new_password);
        } else if (errorData.detail) {
          setErrorMessage(errorData.detail);
        } else {
          setErrorMessage('Erreur lors du changement de mot de passe');
        }
        return;
      }

      const result = await response.json();
      setSuccessMessage(result.message || 'Mot de passe changé avec succès');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      console.error('Erreur réseau:', error);
      setErrorMessage('Erreur réseau lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSaveAccountInfo = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const result = await updateProfile({ company: accountInfo.company });
      if (!result.success) {
        setErrorMessage(result.error || 'Erreur lors de l\'enregistrement');
        return;
      }

      localStorage.setItem('settings_currency', accountInfo.currency || '');
      localStorage.setItem('settings_vat_rate', accountInfo.vatRate || '');
      localStorage.setItem('settings_stock_threshold', accountInfo.stockAlertThreshold || '');

      setSuccessMessage('Informations du compte enregistrées');
    } catch (error) {
      setErrorMessage('Erreur réseau lors de l\'enregistrement');
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
        {/* Header mobile */}
        {isMobile && (
          <AppBar position="sticky" sx={{ bgcolor: 'black', borderBottom: '1px solid rgba(59,130,246,0.1)' }}>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={{ color: 'white' }}>
                Informations 
              </Typography>
            </Toolbar>
          </AppBar>
        )}
        
        <Box sx={{ p: 3 }}>
          <Container maxWidth="md">
            {/* PillNav Navigation */}
            <Box sx={{ mb: 4 }}>
              <PillNav
                logo={notif}
                logoAlt="SmartNotify Logo"
                items={settingsItems}
                activeHref={activeSection}
                onNavItemClick={handleSectionChange}
                className="settings-nav"
                ease="power2.easeOut"
                baseColor="#000000"
                pillColor="#3b82f6"
                hoveredPillTextColor="#ffffff"
                pillTextColor="#94a3b8"
                theme="color"
                initialLoadAnimation={false}
              />
            </Box>

            {/* Sécurité Section */}
            {activeSection === '/settings/security' && (
              <Paper elevation={3} sx={{ p: 4, mt: 4, bgcolor: 'rgba(30,41,59,0.5)', border: '1px solid rgba(59,130,246,0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <LockIcon sx={{ color: '#3b82f6', fontSize: 32 }} />
                  <Box>
                    <Typography variant="h4" sx={{ color: 'white' }}>
                      Sécurité du compte
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      Gérez votre mot de passe et vos paramètres de sécurité
                    </Typography>
                  </Box>
                </Box>

                {successMessage && (
                  <Alert severity="success" sx={{ mb: 3, bgcolor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
                    {successMessage}
                  </Alert>
                )}
                {errorMessage && (
                  <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                    {errorMessage}
                  </Alert>
                )}

                {/* Formulaire de changement de mot de passe */}
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
                    Changer votre mot de passe
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Mot de passe actuel */}
                    <TextField
                      label="Mot de passe actuel"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                      fullWidth
                      size="medium"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => togglePasswordVisibility('current')}
                              edge="end"
                              sx={{ color: '#94a3b8' }}
                            >
                              {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
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

                    {/* Nouveau mot de passe */}
                    <TextField
                      label="Nouveau mot de passe"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      fullWidth
                      size="medium"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => togglePasswordVisibility('new')}
                              edge="end"
                              sx={{ color: '#94a3b8' }}
                            >
                              {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
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

                    {/* Confirmer mot de passe */}
                    <TextField
                      label="Confirmer le mot de passe"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      fullWidth
                      size="medium"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => togglePasswordVisibility('confirm')}
                              edge="end"
                              sx={{ color: '#94a3b8' }}
                            >
                              {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
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

                    {/* Bouton Enregistrer */}
                    <Button
                      onClick={handlePasswordChange}
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
                      {loading ? <CircularProgress size={24} /> : 'Changer le mot de passe'}
                    </Button>
                  </Box>
                </Box>
              </Paper>
            )}

             {/* Section Utilisateur - Gestion des employés */}
            {activeSection === '/settings/preferences' && isAdmin && (
              <Paper elevation={3} sx={{ p: 4, mt: 4, bgcolor: 'rgba(30,41,59,0.5)', border: '1px solid rgba(59,130,246,0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <PersonAddIcon sx={{ color: '#3b82f6', fontSize: 32 }} />
                  <Box>
                    <Typography variant="h4" sx={{ color: 'white' }}>
                      Gestion des utilisateurs
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      Ajoutez et gérez les employés et leurs permissions
                    </Typography>
                  </Box>
                </Box>

                {successMessage && (
                  <Alert severity="success" sx={{ mb: 3, bgcolor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
                    {successMessage}
                  </Alert>
                )}
                {errorMessage && (
                  <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                    {errorMessage}
                  </Alert>
                )}

                {/* Gestion d'équipe - Tableau des employés */}
                <Box sx={{ mt: 4, mb: 6 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ color: 'white' }}>
                      Gestion d'équipe
                    </Typography>
                    <Button
                      startIcon={<PersonAddIcon />}
                      variant="contained"
                      sx={{
                        bgcolor: '#3b82f6',
                        color: 'white',
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                        '&:hover': { bgcolor: '#2563eb' },
                      }}
                      onClick={() => navigate('/employees/new')}
                    >
                      Ajouter un employé
                    </Button>
                  </Box>

                  {usersList.length > 0 ? (
                    <TableContainer 
                      component={Paper}
                      sx={{ 
                        bgcolor: 'rgba(30,41,59,0.5)', 
                        border: '1px solid rgba(59,130,246,0.1)',
                        borderRadius: '10px',
                        overflow: 'hidden'
                      }}
                    >
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'rgba(59,130,246,0.1)', borderBottom: '1px solid rgba(59,130,246,0.2)' }}>
                            <TableCell sx={{ color: '#94a3b8', fontWeight: 600, padding: '16px' }}>Nom</TableCell>
                            <TableCell sx={{ color: '#94a3b8', fontWeight: 600, padding: '16px' }}>Email</TableCell>
                            <TableCell sx={{ color: '#94a3b8', fontWeight: 600, padding: '16px' }}>Rôle</TableCell>
                            <TableCell sx={{ color: '#94a3b8', fontWeight: 600, padding: '16px' }}>Pages autorisées</TableCell>
                            <TableCell sx={{ color: '#94a3b8', fontWeight: 600, padding: '16px', textAlign: 'center' }}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {usersList.map((user) => (
                            <TableRow key={user.id} sx={{ 
                              borderBottom: '1px solid rgba(59,130,246,0.1)',
                              '&:hover': { bgcolor: 'rgba(59,130,246,0.05)' }
                            }}>
                              <TableCell sx={{ color: '#94a3b8', padding: '16px' }}>
                                <Box>
                                  <Typography sx={{ color: 'white', fontWeight: 500 }}>
                                    {user.first_name && user.last_name 
                                      ? `${user.first_name} ${user.last_name}` 
                                      : user.username}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                                    @{user.username}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ color: '#94a3b8', padding: '16px' }}>
                                {user.email}
                              </TableCell>
                            
                              <TableCell sx={{ color: '#94a3b8', padding: '16px' }}>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                  {user.authorized_pages && user.authorized_pages.length > 0 ? (
                                    user.authorized_pages.map((page, idx) => (
                                      <MuiChip 
                                        key={idx}
                                        label={page}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          borderColor: 'rgba(59,130,246,0.3)',
                                          color: '#94a3b8',
                                          fontSize: '0.75rem'
                                        }}
                                      />
                                    ))
                                  ) : (
                                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                                      Aucune restriction
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell sx={{ color: '#94a3b8', padding: '16px', textAlign: 'center' }}>
                                <IconButton 
                                  size="small"
                                  sx={{ color: '#3b82f6', '&:hover': { bgcolor: 'rgba(59,130,246,0.1)' } }}
                                  onClick={() => {
                                    setSelectedUser(user.id);
                                    setEmployeeData({ ...employeeData, role: user.role });
                                    document.getElementById('modify-role-section').scrollIntoView({ behavior: 'smooth' });
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Paper sx={{ p: 3, bgcolor: 'rgba(30,41,59,0.5)', border: '1px solid rgba(59,130,246,0.1)', textAlign: 'center' }}>
                      <Typography sx={{ color: '#64748b' }}>
                        Aucun employé ajouté pour le moment
                      </Typography>
                    </Paper>
                  )}
                </Box>

                {/* Section de modification du rôle d'un utilisateur existant */}
                <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid rgba(59,130,246,0.2)' }} id="modify-role-section">
                  <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
                    Modifier le rôle d'un utilisateur
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {/* Sélection utilisateur */}
                    <FormControl fullWidth>
                      <InputLabel sx={{ color: '#64748b', '&.Mui-focused': { color: '#3b82f6' } }}>Sélectionner un utilisateur</InputLabel>
                      <Select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        label="Sélectionner un utilisateur"
                        sx={{
                          color: '#94a3b8',
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(59,130,246,0.2)' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(59,130,246,0.4)' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                          bgcolor: 'rgba(59,130,246,0.05)',
                          borderRadius: '10px',
                        }}
                      >
                        {usersList.map((user) => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.username} ({user.email}) - {user.role || 'user'}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Nouveau rôle */}
                    <FormControl fullWidth>
                      <InputLabel sx={{ color: '#64748b', '&.Mui-focused': { color: '#3b82f6' } }}>Nouveau rôle</InputLabel>
                      <Select
                        value={employeeData.role}
                        onChange={(e) => setEmployeeData({ ...employeeData, role: e.target.value })}
                        label="Nouveau rôle"
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

                    {/* Bouton Mettre à jour */}
                    <Button
                      onClick={handleUpdateUserRole}
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
                      {loading ? <CircularProgress size={24} /> : 'Mettre à jour le rôle'}
                    </Button>
                  </Box>
                </Box>
              </Paper>
            )}

            {activeSection === '/settings/preferences' && !isAdmin && (
              <Paper elevation={3} sx={{ p: 4, mt: 4, bgcolor: 'rgba(30,41,59,0.5)', border: '1px solid rgba(59,130,246,0.1)' }}>
                <Typography variant="h4" sx={{ color: 'white', mb: 2 }}>
                  Accès refusé
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Cette section est réservée aux administrateurs.
                </Typography>
              </Paper>
            )}

            {/* Contenu par défaut - Général */}
            {activeSection !== '/settings/security' && activeSection !== '/settings/preferences' && (
              <Paper elevation={3} sx={{ p: 4, mt: 4, bgcolor: 'rgba(30,41,59,0.5)', border: '1px solid rgba(59,130,246,0.1)' }}>
                <Typography variant="h4" gutterBottom sx={{ color: 'white', mb: 3 }}>
                  Informations du compte
                </Typography>
                <Typography variant="body1" sx={{ color: '#94a3b8', mb: 4 }}>
                  Configurez vos informations de base
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Nom de l'entreprise */}
                  <Box>
                    <Typography variant="body2" sx={{ color: '#94a3b8', mb: 1, fontWeight: 500 }}>
                      Nom de l'entreprise
                    </Typography>
                    <TextField 
                      fullWidth 
                      placeholder="Entrez le nom de votre entreprise"
                      value={accountInfo.company}
                      onChange={(e) => setAccountInfo({ ...accountInfo, company: e.target.value })}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: '#94a3b8',
                          '& fieldset': { borderColor: 'rgba(59,130,246,0.2)' },
                          '&:hover fieldset': { borderColor: 'rgba(59,130,246,0.4)' },
                          '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                          bgcolor: 'rgba(59,130,246,0.05)',
                          borderRadius: '10px',
                        },
                      }}
                    />
                  </Box>

                  {/* Devise */}
                  <Box>
                    <Typography variant="body2" sx={{ color: '#94a3b8', mb: 1, fontWeight: 500 }}>
                      Devise
                    </Typography>
                    <TextField 
                      fullWidth 
                      placeholder="EUR, USD, TND..."
                      value={accountInfo.currency}
                      onChange={(e) => setAccountInfo({ ...accountInfo, currency: e.target.value })}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: '#94a3b8',
                          '& fieldset': { borderColor: 'rgba(59,130,246,0.2)' },
                          '&:hover fieldset': { borderColor: 'rgba(59,130,246,0.4)' },
                          '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                          bgcolor: 'rgba(59,130,246,0.05)',
                          borderRadius: '10px',
                        },
                      }}
                    />
                  </Box>

                  {/* Taux TVA */}
                  <Box>
                    <Typography variant="body2" sx={{ color: '#94a3b8', mb: 1, fontWeight: 500 }}>
                      Taux TVA (%)
                    </Typography>
                    <TextField 
                      fullWidth 
                      type="number"
                      placeholder="19"
                      value={accountInfo.vatRate}
                      onChange={(e) => setAccountInfo({ ...accountInfo, vatRate: e.target.value })}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: '#94a3b8',
                          '& fieldset': { borderColor: 'rgba(59,130,246,0.2)' },
                          '&:hover fieldset': { borderColor: 'rgba(59,130,246,0.4)' },
                          '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                          bgcolor: 'rgba(59,130,246,0.05)',
                          borderRadius: '10px',
                        },
                      }}
                    />
                  </Box>

                  {/* Seuil d'alerte stock */}
                  <Box>
                    <Typography variant="body2" sx={{ color: '#94a3b8', mb: 1, fontWeight: 500 }}>
                      Seuil d'alerte stock
                    </Typography>
                    <TextField 
                      fullWidth 
                      type="number"
                      placeholder="10"
                      helperText="Recevez une alerte quand le stock est inférieur à cette valeur"
                      value={accountInfo.stockAlertThreshold}
                      onChange={(e) => setAccountInfo({ ...accountInfo, stockAlertThreshold: e.target.value })}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: '#94a3b8',
                          '& fieldset': { borderColor: 'rgba(59,130,246,0.2)' },
                          '&:hover fieldset': { borderColor: 'rgba(59,130,246,0.4)' },
                          '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                          bgcolor: 'rgba(59,130,246,0.05)',
                          borderRadius: '10px',
                        },
                        '& .MuiFormHelperText-root': {
                          color: '#64748b',
                        },
                      }}
                    />
                  </Box>

                  {/* Bouton Enregistrer */}
                  <Button
                    variant="contained"
                    onClick={handleSaveAccountInfo}
                    disabled={loading}
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
                      mt: 2,
                    }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Enregistrer les modifications'}
                  </Button>
                </Box>
              </Paper>
            )}
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Settings;
