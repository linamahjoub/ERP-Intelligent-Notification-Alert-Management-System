import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  useMediaQuery,
  Badge,
  Collapse,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Key as KeyIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon,
  AdminPanelSettings as AdminIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Star as StarIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  ExpandLess,
  ExpandMore,
  Search as SearchIcon,
  FlashOn as FlashOnIcon,
  Storage as StorageIcon,
  Apps as AppsIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import SharedSidebar from "../components/SharedSidebar";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [lastLogin, setLastLogin] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Style global pour éliminer les espaces blancs
  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.backgroundColor = "black";
    document.documentElement.style.backgroundColor = "black";
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const [dashboardData, setDashboardData] = useState({
    stats: {
      activeAlerts: 0,
      sentNotifications: 0,
      resolvedAlerts: 0,
      configuredRules: 0,
      systemStatus: "active",
      totalUsers: 0,
      activeUsers: 0, 
    },
    users: [],
    alerts: [],
    notifications: [],
    alertTrend: [],
    moduleDistribution: [],
    recentActivity: [],
  });



  useEffect(() => {
    if (user) {
      console.log("DASHBOARD DEBUG - User object:", user);
      console.log("is_superuser:", user.is_superuser);
      console.log("is_staff:", user.is_staff);
      console.log("is_active:", user.is_active);

      setLastLogin(new Date().toLocaleString("fr-FR"));
    }
  }, [user]);

  // Composant de graphique simplifié
  const SimpleChart = () => {
    const data = [];
    const maxValue = Math.max(...data);
    const days = [];

    return (
      <Box sx={{ width: "100%", height: 300, position: "relative", pt: 4 }}>
        {/* Axes */}
        <Box
          sx={{
            position: "absolute",
            left: 40,
            right: 20,
            bottom: 30,
            top: 0,
            borderLeft: "1px solid rgba(59, 130, 246, 0.3)",
            borderBottom: "1px solid rgba(59, 130, 246, 0.3)",
          }}
        >
          {/* Lignes horizontales */}
          {[0, 10, 20, 30, 40].map((y) => (
            <Box
              key={y}
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: `${(y / maxValue) * 100}%`,
                borderTop: "1px solid rgba(59, 130, 246, 0.1)",
                height: 0,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  position: "absolute",
                  left: -35,
                  top: -8,
                  color: "#64748b",
                }}
              >
                {y}
              </Typography>
            </Box>
          ))}

          {/* Lignes de données */}
          <Box
            sx={{
              display: "flex",
              height: "100%",
              alignItems: "flex-end",
              justifyContent: "space-around",
              pb: "30px",
              pl: "20px",
              pr: "20px",
            }}
          >
            {data.map((value, index) => {
              const height = `${(value / maxValue) * 100}%`;

              return (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flex: 1,
                    position: "relative",
                  }}
                >
                  {/* Barre du graphique */}
                  <Box
                    sx={{
                      width: "60%",
                      height: height,
                      bgcolor: "rgba(59, 130, 246, 0.1)",
                      borderTopLeftRadius: 4,
                      borderTopRightRadius: 4,
                      position: "relative",
                      mb: 1,
                    }}
                  >
                    {/* Ligne de tendance */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "2px",
                        bgcolor: "#3b82f6",
                      }}
                    />
                    {/* Point de données */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "#3b82f6",
                        border: "2px solid #0a0e27",
                      }}
                    />
                  </Box>

                  {/* Jour */}
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#94a3b8",
                      fontSize: "0.75rem",
                      position: "absolute",
                      bottom: -25,
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  >
                    {days[index]}
                  </Typography>

                  {/* Valeur */}
                  <Typography
                    variant="caption"
                    sx={{
                      position: "absolute",
                      top: `calc(${height} - 30px)`,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#3b82f6",
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  >
                    {value}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  };

  if (!user) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          bgcolor: "black",
          m: 0,
          p: 0,
        }}
      >
        <Typography variant="h4" sx={{ color: "white" }}>
          Chargement...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "black" }}>
      <SharedSidebar mobileOpen={mobileOpen} onMobileClose={handleDrawerToggle} />

      {/* Contenu principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: isMobile ? "100%" : "calc(100% - 280px)",
          minHeight: "100vh",
          bgcolor: "black",
          overflowY: "auto",
          overflowX: "hidden",
          transition: "width 0.3s ease",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            bgcolor: "white(15, 23, 42, 0.4)",
          },
        }}
      >
        {/* Header */}
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
              placeholder="Search alerts, modules, notifications..."
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
            <Badge badgeContent={dashboardData.stats.activeAlerts || 0} color="error">
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
              </IconButton>
            </Badge>
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
                  {user.unread_notifications}
                </Box>
              )}
         

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
                  {user?.is_superuser ? "Administrateur" : "Utilisateur"}
                </Typography>
              </Box>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "#3b82f6",
                  fontWeight: 600,
                  fontSize: "1rem",
                }}
                src={user.avatar}
              >
                {user.first_name?.charAt(0) || user?.username?.charAt(0) || "U"}
              </Avatar>
            </Box>
          </Box>
        </Box>

        {/* Contenu du dashboard */}
        <Box sx={{ p: 3, pb: 6 }}>
          {/* En-tête de la page */}
          <Box sx={{ mb: 4 }}>
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
                  Tableau de Bord
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748b",
                    fontSize: "0.95rem",
                  }}
                >
                  Surveillance en temps réel de vos alertes ERP
                </Typography>
              </Box>

              {/* Bouton Nouvelle Alerte */}
              {user && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{
                    bgcolor: "#3b82f6",
                    color: "white",
                    fontWeight: 600,
                    py: 1.2,
                    px: 3,
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: "0.95rem",
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                    "&:hover": {
                      bgcolor: "#2563eb",
                      boxShadow: "0 6px 16px rgba(59, 130, 246, 0.4)",
                    },
                    minWidth: "140px",
                    height: "42px",
                  }}
                  onClick={() => navigate("/new-alert")}
                >
                  Nouvelle Alerte
                </Button>
              )}
            </Box>
          </Box>

          {/* Cartes de statistiques */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Alertes Actives */}
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
                      sx={{
                        color: "#94a3b8",
                        fontSize: "0.85rem",
                      }}
                    >
                      Alertes Actives
                    </Typography>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: "rgba(251, 146, 60, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <WarningIcon sx={{ color: "#fb923c", fontSize: 20 }} />
                    </Box>
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      color: "white",
                      fontWeight: 700,
                      mb: 1,
                    }}
                  ></Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#ef4444",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                    }}
                  ></Typography>
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
                      sx={{
                        color: "#94a3b8",
                        fontSize: "0.85rem",
                      }}
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
                    sx={{
                      color: "white",
                      fontWeight: 700,
                      mb: 1,
                    }}
                  ></Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#10b981",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                    }}
                  ></Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Alertes Résolues */}
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
                      sx={{
                        color: "#94a3b8",
                        fontSize: "0.85rem",
                      }}
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
                    sx={{
                      color: "white",
                      fontWeight: 700,
                      mb: 1,
                    }}
                  ></Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#10b981",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                    }}
                  ></Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Règles Configurées */}
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
                      sx={{
                        color: "#94a3b8",
                        fontSize: "0.85rem",
                      }}
                    >
                      Règles Configurées
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
                      <FlashOnIcon sx={{ color: "#3b82f6", fontSize: 20 }} />
                    </Box>
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      color: "white",
                      fontWeight: 700,
                      mb: 1,
                    }}
                  ></Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#94a3b8",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                    }}
                  ></Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Sections supplémentaires */}
          <Grid container spacing={3}>
            {/* Tendance des Alertes */}
            <Grid item xs={12} md={8}>
              <Card
                sx={{
                  bgcolor: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                  borderRadius: 3,
                  p: 3,
                }}
              >
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
                    sx={{
                      color: "white",
                      fontWeight: 600,
                    }}
                  >
                    Tendance des Alertes
                  </Typography>
                  <IconButton size="small" sx={{ color: "#64748b" }}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                {/* Graphique intégré */}
                <SimpleChart />
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
