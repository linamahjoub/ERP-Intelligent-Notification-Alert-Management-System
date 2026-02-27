import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
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
import SharedSidebar from "../../components/SharedSidebar";
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
    const canvasRef = useRef(null);
    const animProgress = useRef(0);
    const rafRef = useRef(null);
    const [tooltip, setTooltip] = useState(null);

    const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

    const datasets = [
      {
        label: "envoyées",
        color: "#3b82f6",
        fillColor: "rgba(59, 130, 246, 0.15)",
        data: [45, 52, 60, 44, 72, 24, 18],
      },
      {
        label: "résolues",
        color: "#22c55e",
        fillColor: "rgba(34, 197, 94, 0.15)",
        data: [38, 44, 54, 43, 60, 22, 17],
      },
      {
        label: "critiques",
        color: "#ef4444",
        fillColor: "rgba(239, 68, 68, 0.1)",
        data: [6, 8, 7, 3, 12, 5, 1],
      },
    ];

    const maxVal = 80;
    const yTicks = [0, 20, 40, 60, 80];

    const catmullRomPoints = (pts, tension = 0.4) => {
      const result = [];
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(0, i - 1)];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[Math.min(pts.length - 1, i + 2)];
        result.push({
          cp1x: p1.x + (p2.x - p0.x) * tension,
          cp1y: p1.y + (p2.y - p0.y) * tension,
          cp2x: p2.x - (p3.x - p1.x) * tension,
          cp2y: p2.y - (p3.y - p1.y) * tension,
        });
      }
      return result;
    };

    const drawChart = (progress = 1) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const dpr = window.devicePixelRatio || 1;
      const displayW = canvas.offsetWidth;
      const displayH = canvas.offsetHeight;
      if (displayW === 0 || displayH === 0) return;
      canvas.width = displayW * dpr;
      canvas.height = displayH * dpr;
      ctx.scale(dpr, dpr);

      const W = displayW;
      const H = displayH;
      const padL = 44;
      const padR = 20;
      const padT = 16;
      const padB = 40;
      const chartH = H - padT - padB;
      const chartW = W - padL - padR;

      ctx.clearRect(0, 0, W, H);

      // Y grid + labels
      ctx.font = "11px 'DM Sans', sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.textAlign = "right";
      yTicks.forEach((tick) => {
        const y = padT + chartH - (tick / maxVal) * chartH;
        ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(W - padR, y);
        ctx.stroke();
        ctx.fillText(tick, padL - 8, y + 4);
      });

      // X labels
      ctx.textAlign = "center";
      days.forEach((day, i) => {
        const x = padL + (i / (days.length - 1)) * chartW;
        ctx.fillText(day, x, H - padB + 18);
      });

      // Draw datasets (reversed so "envoyées" is on top)
      [...datasets].reverse().forEach((ds) => {
        const points = ds.data.map((val, i) => ({
          x: padL + (i / (days.length - 1)) * chartW,
          y: padT + chartH - (val * progress / maxVal) * chartH,
        }));

        const cps = catmullRomPoints(points);
        const bottomY = padT + chartH;

        // Filled area
        ctx.beginPath();
        ctx.moveTo(points[0].x, bottomY);
        ctx.lineTo(points[0].x, points[0].y);
        cps.forEach(({ cp1x, cp1y, cp2x, cp2y }, i) => {
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[i + 1].x, points[i + 1].y);
        });
        ctx.lineTo(points[points.length - 1].x, bottomY);
        ctx.closePath();
        ctx.fillStyle = ds.fillColor;
        ctx.fill();

        // Line
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        cps.forEach(({ cp1x, cp1y, cp2x, cp2y }, i) => {
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[i + 1].x, points[i + 1].y);
        });
        ctx.strokeStyle = ds.color;
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.stroke();

        // Dots
        points.forEach((pt) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = ds.color;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = "#0f172a";
          ctx.fill();
        });
      });
    };

    useEffect(() => {
      const startTime = performance.now();
      const duration = 1000;
      const animate = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        animProgress.current = eased;
        drawChart(eased);
        if (progress < 1) rafRef.current = requestAnimationFrame(animate);
      };
      rafRef.current = requestAnimationFrame(animate);
      return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, []);

    useEffect(() => {
      const handleResize = () => drawChart(animProgress.current);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleMouseMove = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const W = rect.width;
      const H = rect.height;
      const padL = 44;
      const padR = 20;
      const padT = 16;
      const padB = 40;
      const chartH = H - padT - padB;
      const chartW = W - padL - padR;

      // Trouver le point le plus proche
      let closestDay = null;
      let closestDist = Infinity;

      datasets[0].data.forEach((_, i) => {
        const x = padL + (i / (days.length - 1)) * chartW;
        const dist = Math.abs(mouseX - x);
        if (dist < closestDist && dist < 30) {
          closestDist = dist;
          closestDay = i;
        }
      });

      if (closestDay !== null) {
        const dayData = datasets.map(ds => ({
          label: ds.label,
          value: ds.data[closestDay],
          color: ds.color,
        }));
        setTooltip({
          day: days[closestDay],
          data: dayData,
          x: e.clientX,
          y: e.clientY,
        });
      } else {
        setTooltip(null);
      }
    };

    const handleMouseLeave = () => {
      setTooltip(null);
    };

    return (
      <Box sx={{ width: "100%", height: "100%" }}>
        <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.82rem", mb: 1.5 }}>
          Tendance sur les 7 derniers jours
        </Typography>

        {/* Canvas */}
        <Box sx={{ width: "100%", height: 220, position: "relative" }}>
          <canvas 
            ref={canvasRef} 
            style={{ width: "100%", height: "100%", display: "block", cursor: "crosshair" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
          
          {/* Tooltip */}
          {tooltip && (
            <Box
              sx={{
                position: "fixed",
                left: tooltip.x + 15,
                top: tooltip.y - 10,
                bgcolor: "rgba(15, 23, 42, 0.98)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: 2,
                p: 1.5,
                minWidth: 140,
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
                zIndex: 9999,
                pointerEvents: "none",
              }}
            >
              <Typography sx={{ color: "white", fontWeight: 700, fontSize: "0.85rem", mb: 1 }}>
                {tooltip.day}
              </Typography>
              {tooltip.data.map((item) => (
                <Box key={item.label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 0.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: item.color }} />
                    <Typography sx={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                      {item.label}
                    </Typography>
                  </Box>
                  <Typography sx={{ color: "white", fontWeight: 700, fontSize: "0.8rem" }}>
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Legend */}
        <Box sx={{ display: "flex", gap: 3, justifyContent: "center", mt: 2 }}>
          {datasets.map((ds) => (
            <Box key={ds.label} sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <Box sx={{ position: "relative", width: 24, height: 12, display: "flex", alignItems: "center" }}>
                <Box sx={{ width: "100%", height: 2, bgcolor: ds.color, borderRadius: 1 }} />
                <Box sx={{
                  position: "absolute", left: "50%", top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 7, height: 7, borderRadius: "50%",
                  bgcolor: ds.color, border: "1.5px solid #0f172a",
                }} />
              </Box>
              <Typography sx={{ fontSize: "0.8rem", color: ds.color, fontWeight: 500 }}>
                {ds.label}
              </Typography>
            </Box>
          ))}
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
