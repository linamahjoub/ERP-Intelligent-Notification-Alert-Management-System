import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Typography,
  Button,
  Paper,
  Box,
  Avatar,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Tooltip,
  Snackbar,
  Tabs,
  Tab,
  Badge,
  Divider,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // États
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  // États pour les dialogues
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [dialogType, setDialogType] = useState('user'); // 'user' ou 'admin'
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Formulaire
  const [newAccount, setNewAccount] = useState({
    email: '',
    username: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
  });
  
  // Notifications
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Vérifie si l'utilisateur est le superadmin
  const isSuperAdmin = user?.email === 'superadmin@example.com';

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAllUsers();
    } else {
      navigate('/dashboard'); // Redirige les non-superadmins
    }
  }, [user, navigate, isSuperAdmin]);

  // Récupère TOUS les utilisateurs
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      // Utilisez votre endpoint API existant ou créez-en un
      // Pour l'instant, on va simuler avec des données
      const usersData = await simulateUsersFetch();
      setAllUsers(usersData);
      
    } catch (error) {
      console.error('Erreur récupération users:', error);
      setError('Erreur de chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  // Simulation de récupération des users (à remplacer par votre API)
  const simulateUsersFetch = async () => {
    // En attendant votre API, voici des données de démo
    return [
      {
        id: 1,
        email: 'superadmin@example.com',
        username: 'superadmin',
        first_name: 'Super',
        last_name: 'Admin',
        is_active: true,
        is_superuser: true,
        is_staff: true,
        date_joined: '2024-01-01T10:00:00Z',
        last_login: new Date().toISOString(),
      },
      {
        id: 2,
        email: 'admin1@example.com',
        username: 'admin1',
        first_name: 'Admin',
        last_name: 'One',
        is_active: true,
        is_superuser: true,
        is_staff: true,
        date_joined: '2024-01-02T10:00:00Z',
        last_login: new Date().toISOString(),
      },
      {
        id: 3,
        email: 'user1@example.com',
        username: 'user1',
        first_name: 'John',
        last_name: 'Doe',
        is_active: true,
        is_superuser: false,
        is_staff: false,
        date_joined: '2024-01-03T10:00:00Z',
        last_login: new Date().toISOString(),
      },
      {
        id: 4,
        email: 'user2@example.com',
        username: 'user2',
        first_name: 'Jane',
        last_name: 'Smith',
        is_active: false,
        is_superuser: false,
        is_staff: false,
        date_joined: '2024-01-04T10:00:00Z',
        last_login: null,
      },
      {
        id: 5,
        email: 'admin2@example.com',
        username: 'admin2',
        first_name: 'Admin',
        last_name: 'Two',
        is_active: true,
        is_superuser: true,
        is_staff: true,
        date_joined: '2024-01-05T10:00:00Z',
        last_login: new Date().toISOString(),
      },
    ];
  };

  // Filtre les users selon l'onglet actif
  const getFilteredUsers = () => {
    let filtered = [...allUsers];
    
    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.email.toLowerCase().includes(term) ||
        u.username.toLowerCase().includes(term) ||
        u.first_name?.toLowerCase().includes(term) ||
        u.last_name?.toLowerCase().includes(term)
      );
    }
    
    // Filtre par onglet
    if (activeTab === 1) { // Admins seulement
      filtered = filtered.filter(u => u.is_superuser);
    } else if (activeTab === 2) { // Users seulement
      filtered = filtered.filter(u => !u.is_superuser);
    } else if (activeTab === 3) { // Inactifs
      filtered = filtered.filter(u => !u.is_active);
    }
    
    return filtered;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const openAddUserDialog = (type = 'user') => {
    setDialogType(type);
    setOpenAddDialog(true);
    setError('');
    setNewAccount({
      email: '',
      username: '',
      password: '',
      password2: '',
      first_name: '',
      last_name: '',
    });
  };

  const handleAddAccount = async () => {
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      
      // Utilisez votre endpoint d'inscription existant
      const response = await axios.post('http://localhost:8000/api/auth/register/', {
        email: newAccount.email,
        username: newAccount.username,
        password: newAccount.password,
        password2: newAccount.password2,
        first_name: newAccount.first_name,
        last_name: newAccount.last_name,
      });
      
      // Si c'est un admin, on pourrait avoir besoin d'un endpoint spécial
      if (dialogType === 'admin') {
        showSnackbar(`✅ Admin ${newAccount.email} créé avec succès !`);
      } else {
        showSnackbar(`✅ Utilisateur ${newAccount.email} créé avec succès !`);
      }
      
      setOpenAddDialog(false);
      fetchAllUsers(); // Recharger la liste
      
    } catch (error) {
      const errorMsg = error.response?.data?.email?.[0] || 
                      error.response?.data?.username?.[0] || 
                      error.response?.data?.detail ||
                      'Erreur lors de la création';
      setError(errorMsg);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      // Simuler l'activation/désactivation
      showSnackbar(`Utilisateur ${currentStatus ? 'désactivé' : 'activé'} avec succès`);
      fetchAllUsers(); // Recharger
    } catch (error) {
      console.error('Erreur changement statut:', error);
      showSnackbar('Erreur lors du changement de statut', 'error');
    }
  };

  const toggleUserRole = async (userId, isCurrentlyAdmin) => {
    try {
      // Simuler changement de rôle
      showSnackbar(`Rôle ${isCurrentlyAdmin ? 'retiré' : 'ajouté'} avec succès`);
      fetchAllUsers(); // Recharger
    } catch (error) {
      console.error('Erreur changement rôle:', error);
      showSnackbar('Erreur lors du changement de rôle', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSuccessMessage(message);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Jamais';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredUsers = getFilteredUsers();
  
  // Statistiques
  const stats = {
    total: allUsers.length,
    admins: allUsers.filter(u => u.is_superuser).length,
    users: allUsers.filter(u => !u.is_superuser).length,
    active: allUsers.filter(u => u.is_active).length,
    inactive: allUsers.filter(u => !u.is_active).length,
  };

  if (!isSuperAdmin) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            Accès réservé au Super Administrateur
          </Alert>
          <Button variant="contained" onClick={() => navigate('/dashboard')}>
            Retour au Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* En-tête Super Admin */}
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                👑 SUPER ADMIN DASHBOARD
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Gestion complète de tous les utilisateurs
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'gold', color: '#764ba2' }}>
                  <StarIcon />
                </Avatar>
                <Typography>
                  Connecté en tant que: <strong>{user?.email}</strong>
                </Typography>
              </Box>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                sx={{ 
                  bgcolor: 'white', 
                  color: '#764ba2',
                  '&:hover': { bgcolor: '#f5f5f5' }
                }}
                onClick={handleLogout}
              >
                Déconnexion
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Cartes de statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Comptes
              </Typography>
              <Typography variant="h3" color="primary">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Administrateurs
              </Typography>
              <Typography variant="h3" color="secondary">
                {stats.admins}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Utilisateurs
              </Typography>
              <Typography variant="h3" color="info.main">
                {stats.users}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Actifs
              </Typography>
              <Typography variant="h3" color="success.main">
                {stats.active}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions rapides */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          ⚡ Actions Rapides
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => openAddUserDialog('user')}
              color="primary"
            >
              Ajouter Utilisateur
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<ShieldIcon />}
              onClick={() => openAddUserDialog('admin')}
              color="secondary"
            >
              Ajouter Admin
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchAllUsers}
            >
              Actualiser
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Barre de recherche et filtres */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher par email, nom, username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label={`Tous (${stats.total})`} />
              <Tab label={`Admins (${stats.admins})`} icon={<AdminIcon />} />
              <Tab label={`Utilisateurs (${stats.users})`} icon={<PersonIcon />} />
              <Tab label={`Inactifs (${stats.inactive})`} icon={<CancelIcon />} />
            </Tabs>
          </Grid>
        </Grid>
      </Paper>

      {/* Tableau des utilisateurs */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">
            {activeTab === 0 ? 'Tous les Comptes' : 
             activeTab === 1 ? 'Administrateurs' : 
             activeTab === 2 ? 'Utilisateurs' : 'Comptes Inactifs'}
             ({filteredUsers.length})
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchAllUsers}
            disabled={loading}
          >
            {loading ? 'Chargement...' : 'Actualiser'}
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Alert severity="info">
            Aucun utilisateur trouvé
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Utilisateur</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Rôle</TableCell>
                  <TableCell>Dernière Connexion</TableCell>
                  <TableCell>Inscription</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((userItem) => (
                  <TableRow 
                    key={userItem.id} 
                    hover
                    sx={{ 
                      bgcolor: userItem.email === 'superadmin@example.com' ? '#fff8e1' : 'inherit',
                      '&:hover': { bgcolor: userItem.email === 'superadmin@example.com' ? '#ffecb3' : '#f5f5f5' }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        #{userItem.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ 
                          mr: 2, 
                          bgcolor: userItem.email === 'superadmin@example.com' ? 'gold' : 
                                  userItem.is_superuser ? 'primary.main' : 'grey.500',
                          color: userItem.email === 'superadmin@example.com' ? '#333' : 'white'
                        }}>
                          {userItem.email === 'superadmin@example.com' ? 
                            <StarIcon /> : 
                            userItem.first_name?.charAt(0) || userItem.username?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1">
                            {userItem.first_name} {userItem.last_name}
                            {userItem.email === 'superadmin@example.com' && (
                              <Chip 
                                label="Super Admin" 
                                size="small" 
                                color="warning" 
                                sx={{ ml: 1 }}
                                icon={<StarIcon />}
                              />
                            )}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            @{userItem.username}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{userItem.email}</TableCell>
                    <TableCell>
                      <Chip 
                        icon={userItem.is_active ? <CheckCircleIcon /> : <CancelIcon />}
                        label={userItem.is_active ? 'Actif' : 'Inactif'}
                        color={userItem.is_active ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {userItem.is_superuser ? (
                        <Chip 
                          label="Administrateur" 
                          color="primary" 
                          size="small" 
                          icon={<AdminIcon />}
                        />
                      ) : (
                        <Chip 
                          label="Utilisateur" 
                          variant="outlined" 
                          size="small" 
                          icon={<PersonIcon />}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(userItem.last_login)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(userItem.date_joined)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        {userItem.email !== 'superadmin@example.com' && (
                          <>
                            <Tooltip title={userItem.is_active ? "Désactiver" : "Activer"}>
                              <IconButton 
                                size="small" 
                                onClick={() => toggleUserStatus(userItem.id, userItem.is_active)}
                                color={userItem.is_active ? "warning" : "success"}
                              >
                                {userItem.is_active ? <CancelIcon /> : <CheckCircleIcon />}
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title={userItem.is_superuser ? "Retirer admin" : "Rendre admin"}>
                              <IconButton 
                                size="small" 
                                onClick={() => toggleUserRole(userItem.id, userItem.is_superuser)}
                                color={userItem.is_superuser ? "secondary" : "primary"}
                              >
                                <AdminIcon />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Supprimer">
                              <IconButton 
                                size="small" 
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        
                        {userItem.email === 'superadmin@example.com' && (
                          <Tooltip title="Super Admin - Actions limitées">
                            <IconButton size="small" disabled>
                              <ShieldIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Dialog pour ajouter un compte */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'admin' ? '➕ Ajouter un Administrateur' : '➕ Ajouter un Utilisateur'}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <TextField
            fullWidth
            margin="normal"
            label="email"
            type="email"
            value={newAccount.email}
            onChange={(e) => setNewAccount({...newAccount, email: e.target.value})}
            required
            placeholder="exemple@email.com"
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Nom d'utilisateur *"
            value={newAccount.username}
            onChange={(e) => setNewAccount({...newAccount, username: e.target.value})}
            required
            placeholder="nom_utilisateur"
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Prénom"
            value={newAccount.first_name}
            onChange={(e) => setNewAccount({...newAccount, first_name: e.target.value})}
            placeholder="Jean"
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Nom"
            value={newAccount.last_name}
            onChange={(e) => setNewAccount({...newAccount, last_name: e.target.value})}
            placeholder="Dupont"
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Mot de passe *"
            type="password"
            value={newAccount.password}
            onChange={(e) => setNewAccount({...newAccount, password: e.target.value})}
            required
            placeholder="••••••••"
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Confirmer mot de passe *"
            type="password"
            value={newAccount.password2}
            onChange={(e) => setNewAccount({...newAccount, password2: e.target.value})}
            required
            placeholder="••••••••"
          />
          
          {dialogType === 'admin' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <strong>Administrateur :</strong> Cet utilisateur aura accès au panel d'administration.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleAddAccount} 
            variant="contained"
            disabled={!newAccount.email || !newAccount.username || !newAccount.password || !newAccount.password2}
          >
            {dialogType === 'admin' ? 'Créer Admin' : 'Créer Utilisateur'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar notifications */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SuperAdminDashboard;
