import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Button,
  useTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Switch,
} from "@mui/material";
import {
  NotificationsActive as NotificationsActiveIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Menu as MenuIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";
import SharedSidebar from "../components/SharedSidebar";

const Alerts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  });

  // Modules avec leurs icônes
  const moduleIcons = {
    stock: <InventoryIcon />,
    crm: <PeopleIcon />,
    facturation: <DescriptionIcon />,
    gmao: <SettingsIcon />,
    gpao: <AssessmentIcon />,
    rh: <PeopleIcon />,
    finance: <DescriptionIcon />,
    production: <SettingsIcon />,
    sales: <AssessmentIcon />,
    purchasing: <InventoryIcon />,
    accounting: <DescriptionIcon />,
  };

  // Fonction pour convertir les opérateurs en symboles
  const getOperatorSymbol = (operator) => {
    switch (operator) {
      case '=': return '=';
      case '>': return '>';
      case '<': return '<';
      case '!=': return '≠';
      case '>=': return '≥';
      case '<=': return '≤';
      case 'greater_than': return '>';
      case 'less_than': return '<';
      case 'equal_to': return '=';
      case 'not_equal': return '≠';
      default: return operator;
    }
  };

  // Récupérer les alertes du localStorage pour l'utilisateur connecté
  const fetchAlerts = () => {
    try {
      setLoading(true);
      
      // Utiliser l'ID de l'utilisateur comme clé unique
      const userId = user?.id || 'guest';
      const storageKey = `alerts_${userId}`;
      
      // Récupérer les alertes depuis localStorage pour cet utilisateur
      const storedAlerts = localStorage.getItem(storageKey);
      const alertsData = storedAlerts ? JSON.parse(storedAlerts) : [];
      
      console.log(`Alertes chargées pour l'utilisateur ${userId}:`, alertsData);
      setAlerts(alertsData);
      
      // Calculer les stats
      const active = alertsData.filter(a => a.isActive).length;
      const critical = alertsData.filter(a => a.severity === 'critical').length;
      const high = alertsData.filter(a => a.severity === 'high').length;
      const medium = alertsData.filter(a => a.severity === 'medium').length;
      const low = alertsData.filter(a => a.severity === 'low').length;
      
      setStats({
        total: alertsData.length,
        active,
        inactive: alertsData.length - active,
        critical,
        high,
        medium,
        low,
      });
      
    } catch (err) {
      console.error("Erreur:", err);
      setErrorMessage("Erreur lors du chargement des alertes");
    } finally {
      setLoading(false);
    }
  };

  // Charger les alertes au montage du composant
  useEffect(() => {
    if (user) {
      fetchAlerts();
    }
  }, [user]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDeleteAlert = () => {
    if (!selectedAlert) return;

    try {
      const userId = user?.id || 'guest';
      const storageKey = `alerts_${userId}`;
      
      // Récupérer les alertes
      const storedAlerts = localStorage.getItem(storageKey);
      const alertsData = storedAlerts ? JSON.parse(storedAlerts) : [];
      
      // Filtrer pour supprimer l'alerte sélectionnée
      const filteredAlerts = alertsData.filter(alert => alert.id !== selectedAlert.id);
      
      // Sauvegarder dans localStorage
      localStorage.setItem(storageKey, JSON.stringify(filteredAlerts));
      
      // Mettre à jour l'état
      setAlerts(filteredAlerts);
      
      // Recalculer les stats
      const active = filteredAlerts.filter(a => a.isActive).length;
      const critical = filteredAlerts.filter(a => a.severity === 'critical').length;
      const high = filteredAlerts.filter(a => a.severity === 'high').length;
      const medium = filteredAlerts.filter(a => a.severity === 'medium').length;
      const low = filteredAlerts.filter(a => a.severity === 'low').length;
      
      setStats({
        total: filteredAlerts.length,
        active,
        inactive: filteredAlerts.length - active,
        critical,
        high,
        medium,
        low,
      });
      
      setSuccessMessage("Alerte supprimée avec succès");
      
    } catch (err) {
      console.error("Erreur:", err);
      setErrorMessage("Erreur lors de la suppression");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedAlert(null);
    }
  };

  const handleToggleStatus = (alert, event) => {
    event.stopPropagation();
    
    try {
      const userId = user?.id || 'guest';
      const storageKey = `alerts_${userId}`;
      
      // Récupérer les alertes
      const storedAlerts = localStorage.getItem(storageKey);
      const alertsData = storedAlerts ? JSON.parse(storedAlerts) : [];
      
      // Mettre à jour le statut
      const updatedAlerts = alertsData.map(a => 
        a.id === alert.id ? { ...a, isActive: !a.isActive } : a
      );
      
      // Sauvegarder dans localStorage
      localStorage.setItem(storageKey, JSON.stringify(updatedAlerts));
      
      // Mettre à jour l'état
      setAlerts(updatedAlerts);
      
      // Recalculer les stats
      const active = updatedAlerts.filter(a => a.isActive).length;
      const critical = updatedAlerts.filter(a => a.severity === 'critical').length;
      const high = updatedAlerts.filter(a => a.severity === 'high').length;
      const medium = updatedAlerts.filter(a => a.severity === 'medium').length;
      const low = updatedAlerts.filter(a => a.severity === 'low').length;
      
      setStats({
        total: updatedAlerts.length,
        active,
        inactive: updatedAlerts.length - active,
        critical,
        high,
        medium,
        low,
      });
      
      setSuccessMessage(`Alerte ${!alert.isActive ? 'activée' : 'désactivée'} avec succès`);
      
    } catch (err) {
      console.error("Erreur:", err);
      setErrorMessage("Erreur lors du changement de statut");
    }
  };

  const handleRefresh = () => {
    fetchAlerts();
    setSuccessMessage("Liste des alertes actualisée");
  };

  // Filtrer les alertes
  const getFilteredAlerts = () => {
    let filtered = [...alerts];

    // Filtre par statut
    if (filterStatus === "active") {
      filtered = filtered.filter(a => a.isActive === true);
    } else if (filterStatus === "inactive") {
      filtered = filtered.filter(a => a.isActive === false);
    } else if (filterStatus === "critical") {
      filtered = filtered.filter(a => a.severity === 'critical');
    } else if (filterStatus === "high") {
      filtered = filtered.filter(a => a.severity === 'high');
    } else if (filterStatus === "medium") {
      filtered = filtered.filter(a => a.severity === 'medium');
    } else if (filterStatus === "low") {
      filtered = filtered.filter(a => a.severity === 'low');
    }

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (alert) =>
          alert.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alert.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alert.module?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredAlerts = getFilteredAlerts();

  // Obtenir la couleur selon la sévérité
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#64748b';
    }
  };

  // Obtenir le label de sévérité
  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 'critical': return 'Critique';
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
      default: return severity;
    }
  };

  // Vérifications initiales
  if (!user) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", bgcolor: "black" }}>
        <CircularProgress sx={{ color: "#3b82f6" }} />
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", bgcolor: "black" }}>
        <CircularProgress sx={{ color: "#3b82f6" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "black" }}>
      <SharedSidebar mobileOpen={mobileOpen} onMobileClose={handleDrawerToggle} />

      <Box component="main" sx={{ flexGrow: 1, width: "100%", minHeight: "100vh", bgcolor: "black", overflowY: "auto" }}>
        {/* En-tête */}
        <Box sx={{ p: 1.2, borderBottom: "1px solid rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          {isMobile && (
            <IconButton onClick={handleDrawerToggle} sx={{ color: "white", mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}

          {/* Barre de recherche */}
          <Box sx={{ flex: 1, maxWidth: 500, position: "relative" }}>
            <SearchIcon sx={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#64748b", fontSize: 20 }} />
            <input
              type="text"
              placeholder="Rechercher une alerte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px 12px 48px",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                borderRadius: "12px",
                color: "#94a3b8",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
          </Box>

          {/* Boutons d'action */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton onClick={handleRefresh} sx={{ color: "#64748b" }}>
              <RefreshIcon />
            </IconButton>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
                <Typography variant="body2" sx={{ color: "white", fontWeight: 600 }}>
                  {user?.first_name || user?.username}
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b" }}>
                  {user?.is_superuser ? 'Administrateur' : 'Utilisateur'}
                </Typography>
              </Box>
              <Avatar sx={{ width: 40, height: 40, bgcolor: "#3b82f6" }}>
                {user?.first_name?.charAt(0) || user?.username?.charAt(0) || "U"}
              </Avatar>
            </Box>
          </Box>
        </Box>

        {/* Titre et bouton d'ajout */}
        <Box sx={{ p: 3, pb: 0 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ color: "white", fontWeight: 700, mb: 0.5 }}>
                Mes Alertes
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.95rem" }}>
                Gérez vos alertes personnalisées
              </Typography>
            </Box>
        
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/new-alert')}
              sx={{
                bgcolor: '#3b82f6',
                color: 'white',
                fontWeight: 600,
                py: 1.2,
                px: 3,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '0.95rem',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                '&:hover': { bgcolor: '#2563eb' },
              }}
            >
              Créer une alerte
            </Button>
          </Box>

          {/* Statistiques */}
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <Chip
              label={`Total: ${stats.total}`}
              onClick={() => setFilterStatus("all")}
              sx={{
                bgcolor: filterStatus === "all" ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.1)",
                color: filterStatus === "all" ? "#3b82f6" : "#94a3b8",
                border: filterStatus === "all" ? "1px solid #3b82f6" : "1px solid rgba(59, 130, 246, 0.2)",
                cursor: "pointer",
                fontWeight: 600,
              }}
            />
            <Chip
              label={`Actives: ${stats.active}`}
              onClick={() => setFilterStatus("active")}
              sx={{
                bgcolor: filterStatus === "active" ? "rgba(16, 185, 129, 0.2)" : "rgba(16, 185, 129, 0.1)",
                color: filterStatus === "active" ? "#10b981" : "#94a3b8",
                border: filterStatus === "active" ? "1px solid #10b981" : "1px solid rgba(16, 185, 129, 0.2)",
                cursor: "pointer",
                fontWeight: 600,
              }}
            />
            <Chip
              label={`Inactives: ${stats.inactive}`}
              onClick={() => setFilterStatus("inactive")}
              sx={{
                bgcolor: filterStatus === "inactive" ? "rgba(239, 68, 68, 0.2)" : "rgba(239, 68, 68, 0.1)",
                color: filterStatus === "inactive" ? "#ef4444" : "#94a3b8",
                border: filterStatus === "inactive" ? "1px solid #ef4444" : "1px solid rgba(239, 68, 68, 0.2)",
                cursor: "pointer",
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>

        {/* Liste des alertes */}
        <Box sx={{ p: 3, pt: 2 }}>
          <Card sx={{ bgcolor: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(59, 130, 246, 0.1)", borderRadius: 3 }}>
            {filteredAlerts.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "rgba(59, 130, 246, 0.05)", borderBottom: "1px solid rgba(59, 130, 246, 0.1)" }}>
                      <TableCell sx={{ color: "#94a3b8", fontWeight: 600 }}>Règle</TableCell>
                      <TableCell sx={{ color: "#94a3b8", fontWeight: 600 }}>Module</TableCell>
                      <TableCell sx={{ color: "#94a3b8", fontWeight: 600 }}>Priorité</TableCell>
                      <TableCell sx={{ color: "#94a3b8", fontWeight: 600 }}>Statut</TableCell>
                      <TableCell sx={{ color: "#94a3b8", fontWeight: 600 }}>Fréquence</TableCell>
                      <TableCell sx={{ color: "#94a3b8", fontWeight: 600 }}>Condition</TableCell>
                      <TableCell align="right" sx={{ color: "#94a3b8", fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAlerts.map((alert) => (
                      <TableRow key={alert.id} sx={{ borderBottom: "1px solid rgba(59, 130, 246, 0.1)", '&:hover': { bgcolor: "rgba(59, 130, 246, 0.05)" } }}>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Avatar sx={{ bgcolor: getSeverityColor(alert.severity) }}>
                              <NotificationsActiveIcon fontSize="small" />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ color: "white", fontWeight: 600 }}>
                                {alert.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#64748b" }}>
                                {alert.description?.substring(0, 50)}{alert.description?.length > 50 ? '...' : ''}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box sx={{ color: "rgba(255,255,255,0.7)" }}>
                              {moduleIcons[alert.module] || <SettingsIcon />}
                            </Box>
                            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                              {getModuleLabel(alert.module)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getSeverityLabel(alert.severity)}
                            size="small"
                            sx={{
                              bgcolor: `${getSeverityColor(alert.severity)}20`,
                              color: getSeverityColor(alert.severity),
                              fontWeight: 600,
                              fontSize: "0.75rem",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={alert.isActive || false}
                            onChange={(e) => handleToggleStatus(alert, e)}
                            size="small"
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#10b981',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                bgcolor: '#10b981',
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                            {alert.schedule === 'immediate' ? 'Immédiat' : 
                             alert.schedule === 'daily' ? 'Quotidien' :
                             alert.schedule === 'weekly' ? 'Hebdomadaire' : 
                             alert.schedule === 'monthly' ? 'Mensuel' : 
                             alert.schedule === 'hourly' ? 'Toutes les heures' : alert.schedule}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {alert.conditions?.length > 0 ? (
                              alert.conditions.slice(0, 2).map((condition, index) => (
                                <Typography key={index} variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                  {condition.field} {getOperatorSymbol(condition.operator)} {condition.value}
                                </Typography>
                              ))
                            ) : alert.conditionType === 'threshold' && alert.thresholdValue ? (
                              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                Seuil {getOperatorSymbol(alert.comparisonOperator)} {alert.thresholdValue}
                              </Typography>
                            ) : (
                              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>Aucune condition</Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                            <Tooltip title="Modifier">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/edit-alert/${alert.id}`)}
                                sx={{ color: "#3b82f6" }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedAlert(alert);
                                  setDeleteDialogOpen(true);
                                }}
                                sx={{ color: "#ef4444" }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <CardContent sx={{ textAlign: "center", py: 8 }}>
                <NotificationsActiveIcon sx={{ fontSize: 64, color: "rgba(255,255,255,0.1)", mb: 2 }} />
                <Typography variant="h6" sx={{ color: "white", mb: 1 }}>
                  Aucune alerte
                </Typography>
                <Typography sx={{ color: "#64748b", mb: 3, maxWidth: 400, mx: "auto" }}>
                  Vous n'avez pas encore créé d'alerte. Commencez dès maintenant !
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/new-alert')}
                  sx={{ bgcolor: '#3b82f6', color: 'white', textTransform: 'none' }}
                >
                  Créer ma première alerte
                </Button>
              </CardContent>
            )}
          </Card>
        </Box>
      </Box>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { bgcolor: "#1e293b", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: "white", borderBottom: "1px solid rgba(239, 68, 68, 0.1)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <DeleteIcon sx={{ color: "#ef4444" }} />
            Supprimer l'alerte
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography sx={{ color: "#94a3b8", mb: 2 }}>
            Êtes-vous sûr de vouloir supprimer l'alerte{" "}
            <strong style={{ color: "white" }}>{selectedAlert?.name}</strong> ?
          </Typography>
          <Alert severity="warning" sx={{ bgcolor: "rgba(251, 146, 60, 0.1)", border: "1px solid rgba(251, 146, 60, 0.2)" }}>
            Cette action est irréversible.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid rgba(239, 68, 68, 0.1)" }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: "#94a3b8" }}>
            Annuler
          </Button>
          <Button onClick={handleDeleteAlert} variant="contained" sx={{ bgcolor: "#ef4444", '&:hover': { bgcolor: "#dc2626" } }}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage("")}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>{successMessage}</Alert>
      </Snackbar>
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={3000}
        onClose={() => setErrorMessage("")}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity="error" sx={{ width: "100%" }}>{errorMessage}</Alert>
      </Snackbar>
    </Box>
  );
};

// Fonction pour obtenir le libellé du module
const getModuleLabel = (moduleValue) => {
  const modules = [
    { value: 'stock', label: 'Stock' },
    { value: 'crm', label: 'CRM' },
    { value: 'facturation', label: 'Facturation' },
    { value: 'gmao', label: 'GMAO' },
    { value: 'gpao', label: 'GPAO' },
    { value: 'rh', label: 'Ressources Humaines' },
    { value: 'finance', label: 'Finance' },
    { value: 'production', label: 'Production' },
    { value: 'sales', label: 'Ventes' },
    { value: 'purchasing', label: 'Achats' },
    { value: 'accounting', label: 'Comptabilité' },
  ];
  
  const module = modules.find(m => m.value === moduleValue);
  return module ? module.label : moduleValue;
};

export default Alerts;