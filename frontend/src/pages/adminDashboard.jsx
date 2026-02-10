import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
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
  Paper,
  Chip,
  LinearProgress,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Tooltip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Link,
  CircularProgress,
} from "@mui/material";
import {
  Person as PersonIcon,
  Group as GroupIcon,
  Storage as StorageIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  AdminPanelSettings as AdminIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Menu as MenuIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Sync as SyncIcon,
  Settings as SettingsIcon,
  Inventory as InventoryIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import SharedSidebar from "../components/SharedSidebar";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);

  // Données mock pour le dashboard d'alertes
  const [dashboardData, setDashboardData] = useState({
    stats: {
      activeAlerts: 0,
      sentNotifications: 0,
      resolvedAlerts: 0,
      configuredRules: 0,
      systemStatus: "active",
    },
    users: [],
    alerts: [],
    notifications: [],
    alertTrend: [],
    moduleDistribution: [],
    recentActivity: [],
  });

  const mockData = {
    stats: {
      activeAlerts: 0,
      sentNotifications: 0,
      resolvedAlerts: 0,
      configuredRules: 0,
    },
    users: [], // Ajoutez ceci
    alerts: [], // Ajoutez ceci
    notifications: [], // Ajoutez ceci
    alertTrend: [], // Ajoutez ceci
    moduleDistribution: [], // Ajoutez ceci
    recentActivity: [], // Ajoutez ceci
  };

  // Couleurs pour les graphiques
  const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];

  // Fonction pour obtenir l'icône selon le type d'activité
  const getActivityIcon = (iconType) => {
    switch (iconType) {
      case "warning":
        return <ErrorIcon sx={{ fontSize: 20 }} />;
      case "check":
        return <CheckCircleIcon sx={{ fontSize: 20 }} />;
      case "notification":
        return <NotificationsIcon sx={{ fontSize: 20 }} />;
      case "sync":
        return <SyncIcon sx={{ fontSize: 20 }} />;
      case "user":
        return <PersonAddIcon sx={{ fontSize: 20 }} />;
      case "settings":
        return <SettingsIcon sx={{ fontSize: 20 }} />;
      case "package":
        return <InventoryIcon sx={{ fontSize: 20 }} />;
      default:
        return <NotificationsIcon sx={{ fontSize: 20 }} />;
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        // 1. Récupérer le token d'authentification
        const token = localStorage.getItem("access_token");

        // 2. Appeler votre API pour avoir la liste des utilisateurs
        const response = await fetch("http://localhost:8000/api/admin/users/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const usersData = await response.json();

          // 3. Compter combien d'utilisateurs il y a
          const totalUsers = usersData.length;
          const activeUsers = usersData.filter((user) => user.is_active).length;

          // 4. Mettre à jour les données
          setDashboardData({
            stats: {
              activeAlerts: 0,
              sentNotifications: 0,
              resolvedAlerts: 0,
              configuredRules: 0,
              totalUsers: totalUsers, // Ajouté ici
              activeUsers: activeUsers, // Ajouté ici
            },
            users: usersData,
            alerts: [],
            notifications: [],
            alertTrend: [],
            moduleDistribution: [],
            recentActivity: [],
          });
        }
      } catch (err) {
        console.log("Erreur:", err);
        // Garder les données mock si erreur
        setDashboardData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleEditUser = () => {
    if (selectedUser && selectedUser.id) {
      navigate(`/admin/users/${selectedUser.id}/edit`);
      handleMenuClose();
    }
  };

  const handleDeleteUser = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDeleteUser = () => {
    // Simulation de suppression
    if (selectedUser?.name) {
      setSuccessMessage(
        `Utilisateur "${selectedUser.name}" supprimé avec succès`,
      );
    }
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const handleAddUser = () => {
    navigate("/admin/users/new");
  };

  const handleRefreshData = () => {
    setSuccessMessage("Données actualisées avec succès");
  };

  const handleExportData = () => {
    setSuccessMessage("Exportation des données démarrée");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "warning";
      case "maintenance":
        return "info";
      case "critical":
        return "error";
      case "warning":
        return "warning";
      case "info":
        return "info";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircleIcon fontSize="small" />;
      case "inactive":
        return <ErrorIcon fontSize="small" />;
      case "critical":
        return <ErrorIcon fontSize="small" />;
      case "warning":
        return <WarningIcon fontSize="small" />;
      default:
        return <WarningIcon fontSize="small" />;
    }
  };

  // Vérifications initiales
  if (!user) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          bgcolor: "black",
        }}
      >
        <Typography variant="h4" sx={{ color: "white" }}>
          Chargement...
        </Typography>
      </Box>
    );
  }

  const isAdmin = user?.is_superuser || user?.is_staff;
  if (!isAdmin) {
    navigate("/dashboard");
    return null;
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          bgcolor: "black",
        }}
      >
        <CircularProgress sx={{ color: "#3b82f6" }} />
      </Box>
    );
  }

  // RENDER PRINCIPAL (UN SEUL RETURN)
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "black" }}>
      {/* Sidebar partagé */}
      <SharedSidebar
        mobileOpen={mobileOpen}
        onMobileClose={handleDrawerToggle}
      />

      {/* Contenu principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          minHeight: "100vh",
          bgcolor: "black",
          overflowY: "auto",
          overflowX: "hidden",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            bgcolor: "rgba(15, 23, 42, 0.4)",
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "rgba(59, 130, 246, 0.3)",
            borderRadius: "4px",
            "&:hover": {
              bgcolor: "rgba(59, 130, 246, 0.5)",
            },
          },
        }}
      >
        <Box
          sx={{
            p: 1.2,
            borderBottom: "1px solid rgba(59, 130, 246, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          {/* Menu mobile icon */}
          {isMobile && (
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                color: "white",
                mr: 1,
                "&:hover": {
                  bgcolor: "rgba(59, 130, 246, 0.1)",
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Barre de recherche */}
          <Box
            sx={{
              flex: 1,
              maxWidth: 500,
              position: "relative",
            }}
          >
            <SearchIcon
              sx={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748b",
                fontSize: 20,
              }}
            />
            <input
              type="text"
              placeholder="Rechercher dans le dashboard..."
              style={{
                width: "100%",
                padding: "12px 16px 12px 48px",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                borderRadius: "12px",
                color: "#94a3b8",
                fontSize: "0.9rem",
                outline: "none",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.backgroundColor = "rgba(59, 130, 246, 0.2)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(59, 130, 246, 0.2)";
                e.target.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
              }}
            />
          </Box>

          {/* Boutons d'action */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              sx={{
                color: "#64748b",
                position: "relative",
                "&:hover": {
                  bgcolor: "rgba(59, 130, 246, 0.1)",
                },
              }}
            >
              <NotificationsIcon />
              {user?.unread_notifications > 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    bgcolor: "#ef4444",
                    color: "white",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {user.unread_notifications || 0}
                </Box>
              )}
            </IconButton>

            

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  textAlign: "right",
                  display: { xs: "none", sm: "block" },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  {user?.first_name || user?.username}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#64748b",
                    fontSize: "0.75rem",
                  }}
                >
                  {isAdmin ? "Administrateur" : "Utilisateur"}
                </Typography>
              </Box>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: isAdmin ? "#ef4444" : "#3b82f6",
                  fontWeight: 600,
                  fontSize: "1rem",
                }}
              >
                {user?.first_name?.charAt(0) ||
                  user?.username?.charAt(0) ||
                  "U"}
              </Avatar>
            </Box>
          </Box>
        </Box>
        {/* Titre de la page - sous l'en-tête */}
        <Box sx={{ p: 3, pb: 0 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  color: "white",
                  fontWeight: 700,
                  mb: 0.5,
                }}
              >
                Tableau de Bord Administrateur
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  fontSize: "0.95rem",
                }}
              >
                Gestion complète du système et surveillance
              </Typography>
            </Box>
          </Box>
         
        </Box>

        {/* Contenu du dashboard */}
        <Box sx={{ p: 3, pt: 0, pb: 6 }}>
          {/* Statistiques principales */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Alertes Actives */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  bgcolor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  borderRadius: 3,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 24px rgba(239, 68, 68, 0.2)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "#94a3b8", fontSize: "0.85rem" }}
                    >
                      Alertes Actives
                    </Typography>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: "rgba(239, 68, 68, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <WarningIcon sx={{ color: "#ef4444", fontSize: 20 }} />
                    </Box>
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{ color: "white", fontWeight: 700, mb: 1 }}
                  >
                    {dashboardData.stats.activeAlerts}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ErrorIcon sx={{ color: "#ef4444", fontSize: 16 }} />
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#ef4444",
                        fontSize: "0.8rem",
                        fontWeight: 500,
                      }}
                    >
                      Nécessite attention
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Notifications Envoyées */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  bgcolor: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                  borderRadius: 3,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 24px rgba(59, 130, 246, 0.2)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "#94a3b8", fontSize: "0.85rem" }}
                    >
                      Notifications Envoyées
                    </Typography>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: "rgba(59, 130, 246, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <NotificationsIcon
                        sx={{ color: "#3b82f6", fontSize: 20 }}
                      />
                    </Box>
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{ color: "white", fontWeight: 700, mb: 1 }}
                  >
                    {dashboardData.stats.sentNotifications.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TrendingUpIcon sx={{ color: "#10b981", fontSize: 16 }} />
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#10b981",
                        fontSize: "0.8rem",
                        fontWeight: 500,
                      }}
                    >
                      //notifications envoyees
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Alertes Résolues */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  bgcolor: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  borderRadius: 3,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 24px rgba(16, 185, 129, 0.2)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "#94a3b8", fontSize: "0.85rem" }}
                    >
                      Alertes Résolues
                    </Typography>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: "rgba(16, 185, 129, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CheckCircleIcon
                        sx={{ color: "#10b981", fontSize: 20 }}
                      />
                    </Box>
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{ color: "white", fontWeight: 700, mb: 1 }}
                  >
                    {dashboardData.stats.resolvedAlerts}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TrendingUpIcon sx={{ color: "#10b981", fontSize: 16 }} />
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#10b981",
                        fontSize: "0.8rem",
                        fontWeight: 500,
                      }}
                    >
                      //nombre d'alerte
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Utilisateurs Totaux */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  bgcolor: "rgba(139, 92, 246, 0.1)",
                  border: "1px solid rgba(139, 92, 246, 0.2)",
                  borderRadius: 3,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 24px rgba(139, 92, 246, 0.2)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "#94a3b8", fontSize: "0.85rem" }}
                    >
                      Utilisateurs Totaux
                    </Typography>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: "rgba(139, 92, 246, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <PeopleIcon sx={{ color: "#8b5cf6", fontSize: 20 }} />
                    </Box>
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{ color: "white", fontWeight: 700, mb: 1 }}
                  >
                    {dashboardData.stats.totalUsers || 0}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PeopleIcon sx={{ color: "#8b5cf6", fontSize: 16 }} />
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#8b5cf6",
                        fontSize: "0.8rem",
                        fontWeight: 500,
                      }}
                    >
                      {dashboardData.stats.activeUsers || 0} actifs
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Graphiques et données */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Activité des notifications */}
            <Grid item xs={12} lg={8}>
              <Card
                sx={{
                  bgcolor: "rgba(30, 41, 59, 0.5)",
                  border: "1px solid rgba(59, 130, 246, 0.1)",
                  borderRadius: 3,
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 3, height: "100%" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ color: "white", fontWeight: 600 }}
                    >
                      Activité des notifications
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: 200,
                    }}
                  >
                    <BarChartIcon
                      sx={{ fontSize: 48, color: "#3b82f6", mb: 1 }}
                    />
                    <Typography sx={{ color: "#94a3b8", ml: 2 }}>
                      Graphique en cours de développement
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Répartition des alertes */}
            <Grid item xs={12} lg={4}>
              <Card
                sx={{
                  bgcolor: "rgba(30, 41, 59, 0.5)",
                  border: "1px solid rgba(59, 130, 246, 0.1)",
                  borderRadius: 3,
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 3, height: "100%" }}>
                  <Typography
                    variant="h6"
                    sx={{ color: "white", fontWeight: 600, mb: 3 }}
                  >
                    Répartition des alertes
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      {dashboardData.alertTrend &&
                      dashboardData.alertTrend.length > 0 ? (
                        dashboardData.alertTrend
                          .slice(0, 5)
                          .map((day, index) => {
                            const percentage = (day.alerts / 20) * 100;
                            return (
                              <Box key={index} sx={{ mb: 1 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    mb: 0.5,
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      color: "white",
                                      fontSize: "0.875rem",
                                    }}
                                  >
                                    {day.name}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      color: "#94a3b8",
                                      fontSize: "0.875rem",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {day.alerts} alertes
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={percentage}
                                  sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: "rgba(255, 255, 255, 0.1)",
                                    "& .MuiLinearProgress-bar": {
                                      bgcolor: COLORS[index % COLORS.length],
                                      borderRadius: 4,
                                    },
                                  }}
                                />
                              </Box>
                            );
                          })
                      ) : (
                        <Typography
                          sx={{ color: "#64748b", textAlign: "center", py: 4 }}
                        >
                          Aucune donnée de tendance disponible
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Liste des utilisateurs et activité récente */}
          <Grid container spacing={3}>
            {/* Activité récente - Timeline */}
            <Grid item xs={12} lg={6}>
              <Card
                sx={{
                  bgcolor: "rgba(30, 41, 59, 0.5)",
                  border: "1px solid rgba(59, 130, 246, 0.1)",
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ color: "white", fontWeight: 600, mb: 0.5 }}
                    >
                      Activité récente
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#64748b", fontSize: "0.875rem" }}
                    >
                      Derniers événements système
                    </Typography>
                  </Box>

                  {/* Timeline */}
                  <Box sx={{ position: "relative", pl: 4 }}>
                    {/* Ligne verticale de la timeline */}
                    <Box
                      sx={{
                        position: "absolute",
                        left: "18px",
                        top: "12px",
                        bottom: "12px",
                        width: "2px",
                        bgcolor: "rgba(59, 130, 246, 0.2)",
                      }}
                    />

                    {/* Événements */}
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                    >
                      {dashboardData.recentActivity.map((activity, index) => (
                        <Box
                          key={activity.id}
                          sx={{
                            position: "relative",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              transform: "translateX(4px)",
                            },
                          }}
                        >
                          {/* Icône de l'événement */}
                          <Box
                            sx={{
                              position: "absolute",
                              left: "-34px",
                              top: "2px",
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              bgcolor: `${activity.color}15`,
                              border: `2px solid ${activity.color}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: activity.color,
                              zIndex: 1,
                            }}
                          >
                            {getActivityIcon(activity.icon)}
                          </Box>

                          {/* Contenu de l'événement */}
                          <Box>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                mb: 0.5,
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  color: "white",
                                  fontWeight: 600,
                                  fontSize: "0.9rem",
                                }}
                              >
                                {activity.title}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#64748b",
                                  fontSize: "0.75rem",
                                  whiteSpace: "nowrap",
                                  ml: 2,
                                }}
                              >
                                {activity.time}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{ color: "#94a3b8", fontSize: "0.85rem" }}
                            >
                              {activity.description}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Alertes récentes */}
            <Grid item xs={12} lg={6}>
              <Card
                sx={{
                  bgcolor: "rgba(30, 41, 59, 0.5)",
                  border: "1px solid rgba(59, 130, 246, 0.1)",
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ color: "white", fontWeight: 600 }}
                    >
                      Alertes Récentes
                    </Typography>
                    <Badge
                      badgeContent={dashboardData.stats.activeAlerts}
                      color="error"
                    >
                      <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={handleExportData}
                        sx={{
                          color: "#3b82f6",
                          textTransform: "none",
                          fontSize: "0.875rem",
                        }}
                      >
                        Exporter
                      </Button>
                    </Badge>
                  </Box>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {dashboardData.alerts && dashboardData.alerts.length > 0 ? (
                      dashboardData.alerts.slice(0, 5).map((alert) => (
                        <Paper
                          key={alert.id}
                          sx={{
                            p: 2,
                            bgcolor: "rgba(30, 41, 59, 0.3)",
                            border: "1px solid",
                            borderColor:
                              alert.type === "critical"
                                ? "rgba(239, 68, 68, 0.2)"
                                : alert.type === "warning"
                                  ? "rgba(251, 146, 60, 0.2)"
                                  : "rgba(59, 130, 246, 0.2)",
                            borderRadius: 2,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              transform: "translateX(4px)",
                              borderColor:
                                alert.type === "critical"
                                  ? "#ef4444"
                                  : alert.type === "warning"
                                    ? "#f59e0b"
                                    : "#3b82f6",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                            }}
                          >
                            <Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  mb: 0.5,
                                }}
                              >
                                {getStatusIcon(alert.type)}
                                <Typography
                                  variant="subtitle2"
                                  sx={{ color: "white", fontWeight: 600 }}
                                >
                                  {alert.module || "Système"}
                                </Typography>
                                <Chip
                                  label={
                                    alert.type === "critical"
                                      ? "Critique"
                                      : alert.type === "warning"
                                        ? "Avertissement"
                                        : "Info"
                                  }
                                  size="small"
                                  color={getStatusColor(alert.type)}
                                  sx={{ height: 20, fontSize: "0.65rem" }}
                                />
                              </Box>
                              <Typography
                                variant="body2"
                                sx={{ color: "#94a3b8", mb: 1 }}
                              >
                                {alert.message || "Alerte système"}
                              </Typography>
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{ color: "#64748b" }}
                            >
                              {alert.time || "Récemment"}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mt: 1,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: "#64748b" }}
                            >
                              Status:{" "}
                              {alert.status === "active" ? "Actif" : "Résolu"}
                            </Typography>
                            <Button size="small" sx={{ fontSize: "0.75rem" }}>
                              Voir les détails
                            </Button>
                          </Box>
                        </Paper>
                      ))
                    ) : (
                      <Typography
                        sx={{ color: "#64748b", textAlign: "center", py: 4 }}
                      >
                        Aucune alerte récente
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Menu contextuel */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            bgcolor: "#1e293b",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            borderRadius: 2,
            minWidth: 180,
          },
        }}
      >
        <MenuItem
          onClick={handleEditUser}
          sx={{
            color: "#94a3b8",
            "&:hover": { bgcolor: "rgba(59, 130, 246, 0.1)" },
          }}
        >
          <EditIcon sx={{ mr: 1, fontSize: 20, color: "#3b82f6" }} />
          Modifier
        </MenuItem>
        <MenuItem
          onClick={handleDeleteUser}
          sx={{
            color: "#94a3b8",
            "&:hover": { bgcolor: "rgba(59, 130, 246, 0.1)" },
          }}
        >
          <DeleteIcon sx={{ mr: 1, fontSize: 20, color: "#ef4444" }} />
          Supprimer
        </MenuItem>
      </Menu>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: "#1e293b",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "white",
            borderBottom: "1px solid rgba(239, 68, 68, 0.1)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ErrorIcon sx={{ color: "#ef4444" }} />
            Confirmer la suppression
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography sx={{ color: "#94a3b8", mb: 2 }}>
            Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
            <strong style={{ color: "white" }}>{selectedUser?.name}</strong> ?
          </Typography>
          <Alert
            severity="warning"
            sx={{
              bgcolor: "rgba(251, 146, 60, 0.1)",
              border: "1px solid rgba(251, 146, 60, 0.2)",
            }}
          >
            Cette action est irréversible. Toutes les données associées seront
            également supprimées.
          </Alert>
        </DialogContent>
        <DialogActions
          sx={{ p: 3, borderTop: "1px solid rgba(239, 68, 68, 0.1)" }}
        >
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              color: "#94a3b8",
              "&:hover": {
                bgcolor: "rgba(59, 130, 246, 0.1)",
              },
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={confirmDeleteUser}
            variant="contained"
            sx={{
              bgcolor: "#ef4444",
              color: "white",
              fontWeight: 600,
              "&:hover": {
                bgcolor: "#dc2626",
              },
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les messages */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage("")}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          {successMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={3000}
        onClose={() => setErrorMessage("")}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity="error" sx={{ width: "100%" }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;