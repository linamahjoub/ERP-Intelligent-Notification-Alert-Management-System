import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useActivityContext } from "../../context/ActivityContext";
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
  Paper,
  Chip,
  Menu,
  MenuItem,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  AdminPanelSettings as AdminIcon,
  Download as DownloadIcon,
  Menu as MenuIcon,
  People as PeopleIcon,
  Sync as SyncIcon,
  Settings as SettingsIcon,
  Inventory as InventoryIcon,
  PersonAdd as PersonAddIcon,
  Category as CategoryIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import SharedSidebar from "../../components/SharedSidebar";

// ─────────────────────────────────────────────
// NotificationActivityChart (Canvas Area Chart)
// ─────────────────────────────────────────────
const NotificationActivityChart = () => {
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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
        <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
          Activité des notifications
        </Typography>
      </Box>
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

// ─────────────────────────────────────────────
// AdminDashboard principal
// ─────────────────────────────────────────────
const AdminDashboard = () => {
  const { user } = useAuth();
  const { activityRefreshTrigger } = useActivityContext();
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
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [alertDetailsOpen, setAlertDetailsOpen] = useState(false);
  const [notificationsData, setNotificationsData] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);

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

  const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"];

  const formatActivityTime = (value) => {
    if (!value) return "Récemment";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
  };

  const formatRelativeTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return "Maintenant";
    if (diffMinutes < 60) return `${diffMinutes}m`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}j`;
  };

  const getNotificationDotColor = (notif) => {
    const type = String(notif?.notification_type || "").toLowerCase();
    if (type.includes("alert")) return "#ef4444";
    if (type.includes("warning")) return "#f59e0b";
    return "#10b981";
  };

  const mapActivityToTimeline = (activity) => {
    const actionType = activity?.action_type;
    let icon = "notification";
    let color = "#8b5cf6";
    let title = activity?.title || "Activité système";
    let description = activity?.description || "";

    if (actionType === "product_created") { icon = "package"; color = "#3b82f6"; title = activity?.title || "Nouveau produit"; }
    else if (actionType === "user_created") { icon = "user"; color = "#10b981"; title = activity?.title || "Nouvel utilisateur"; }
    else if (actionType === "category_created") { icon = "category"; color = "#f59e0b"; title = activity?.title || "Nouvelle catégorie"; }
    else if (actionType === "alert_created") { icon = "notification"; color = "#ef4444"; title = activity?.title || "Nouvelle alerte"; }

    return {
      id: activity?.id || `${actionType}-${activity?.created_at || Math.random()}`,
      icon, color, title, description,
      time: formatActivityTime(activity?.created_at),
    };
  };

  const getActivityIcon = (iconType) => {
    switch (iconType) {
      case "warning": return <ErrorIcon sx={{ fontSize: 20 }} />;
      case "check": return <CheckCircleIcon sx={{ fontSize: 20 }} />;
      case "notification": return <NotificationsIcon sx={{ fontSize: 20 }} />;
      case "sync": return <SyncIcon sx={{ fontSize: 20 }} />;
      case "user": return <PersonAddIcon sx={{ fontSize: 20 }} />;
      case "settings": return <SettingsIcon sx={{ fontSize: 20 }} />;
      case "package": return <InventoryIcon sx={{ fontSize: 20 }} />;
      case "category": return <CategoryIcon sx={{ fontSize: 20 }} />;
      default: return <NotificationsIcon sx={{ fontSize: 20 }} />;
    }
  };

  // Fetch principale
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");

        const [usersResponse, alertsResponse] = await Promise.all([
          fetch("http://localhost:8000/api/admin/users/", {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          }),
          fetch("http://localhost:8000/api/alerts/", {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          }),
        ]);

        const usersData = usersResponse.ok ? await usersResponse.json() : {};
        const alertsData = alertsResponse.ok ? await alertsResponse.json() : {};

        const users = Array.isArray(usersData) ? usersData : (usersData.results || []);
        let allAlerts = [];
        if (Array.isArray(alertsData)) allAlerts = alertsData;
        else if (alertsData.results) allAlerts = alertsData.results;
        else if (alertsData.data) allAlerts = alertsData.data;

        const totalUsers = users.length;
        const activeUsers = users.filter((u) => u.is_active === true).length;
        const activeAlerts = allAlerts.filter((a) =>
          a.is_active === true || a.status === "active" || a.status === "ACTIVE" || a.active === true
        ).length;

        setDashboardData((prev) => ({
          ...prev,
          stats: {
            activeAlerts,
            sentNotifications: 0,
            resolvedAlerts: 0,
            configuredRules: allAlerts.length,
            totalUsers,
            activeUsers,
          },
          users,
          alerts: allAlerts,
        }));
      } catch (err) {
        console.log("Erreur dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Polling activités récentes
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch("http://localhost:8000/api/activity/recent/?limit=6", {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : (data?.results || []);
          setDashboardData((prev) => ({
            ...prev,
            recentActivity: items.map(mapActivityToTimeline),
          }));
        }
      } catch (err) {
        console.log("Erreur activités:", err);
      }
    };
    fetchActivities();
    const interval = setInterval(fetchActivities, 3000);
    return () => clearInterval(interval);
  }, [activityRefreshTrigger]);

  // Polling notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:8000/api/notifications/", {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json) ? json : (json?.results || []);
        setNotificationsData(items);
        setUnreadNotifications(items.filter((i) => i?.is_read === false));
      }
    } catch (err) {
      console.log("Erreur notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuClick = (event, user) => { setAnchorEl(event.currentTarget); setSelectedUser(user); };
  const handleMenuClose = () => { setAnchorEl(null); setSelectedUser(null); };
  const handleEditUser = () => { if (selectedUser?.id) { navigate(`/admin/users/${selectedUser.id}/edit`); handleMenuClose(); } };
  const handleDeleteUser = () => { setDeleteDialogOpen(true); handleMenuClose(); };
  const confirmDeleteUser = () => {
    if (selectedUser?.name) setSuccessMessage(`Utilisateur "${selectedUser.name}" supprimé avec succès`);
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };
  const handleExportData = () => setSuccessMessage("Exportation des données démarrée");
  const handleOpenNotifications = (e) => setNotificationsAnchorEl(e.currentTarget);
  const handleCloseNotifications = () => setNotificationsAnchorEl(null);
  const handleMarkAllNotificationsRead = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:8000/api/notifications/mark_all_as_read/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.ok) await fetchNotifications();
    } catch (err) {
      console.log("Erreur marquage notifications:", err);
    }
  };
  const handleViewAlertDetails = (alert) => { setSelectedAlert(alert); setAlertDetailsOpen(true); };
  const handleCloseAlertDetails = () => { setAlertDetailsOpen(false); setSelectedAlert(null); };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "success";
      case "inactive": return "warning";
      case "critical": return "error";
      case "warning": return "warning";
      case "info": return "info";
      default: return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active": return <CheckCircleIcon fontSize="small" />;
      case "critical": return <ErrorIcon fontSize="small" />;
      case "warning": return <WarningIcon fontSize="small" />;
      default: return <WarningIcon fontSize="small" />;
    }
  };

  const modulePalette = ["#1e88e5", "#a855f7", "#22c55e", "#fb923c", "#06b6d4", "#ef4444"];

  const moduleDistribution = (() => {
    const counts = {};
    (dashboardData.alerts || []).forEach((alert) => {
      const key = String(alert?.module || "Système").trim().toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    });
    const entries = Object.entries(counts).map(([key, value]) => ({ key, label: key, value })).sort((a, b) => b.value - a.value);
    const top = entries.slice(0, 5);
    const restTotal = entries.slice(5).reduce((s, i) => s + i.value, 0);
    if (restTotal > 0) top.push({ key: "autres", label: "Autres", value: restTotal });
    const total = entries.reduce((s, i) => s + i.value, 0);
    const items = top.map((item, idx) => ({
      ...item,
      label: item.label.charAt(0).toUpperCase() + item.label.slice(1),
      color: modulePalette[idx % modulePalette.length],
    }));
    return { total, items };
  })();

  const moduleDistributionItems = moduleDistribution.items.map((item) => ({
    ...item,
    percent: moduleDistribution.total > 0 ? Math.round((item.value / moduleDistribution.total) * 100) : 0,
  }));

  const moduleConicGradient = (() => {
    if (moduleDistribution.total === 0) return "rgba(148, 163, 184, 0.2) 0% 100%";
    let acc = 0;
    return moduleDistribution.items.map((item) => {
      const pct = (item.value / moduleDistribution.total) * 100;
      const start = acc;
      acc += pct;
      return `${item.color} ${start}% ${acc}%`;
    }).join(", ");
  })();

  if (!user) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", bgcolor: "black" }}>
        <Typography variant="h4" sx={{ color: "white" }}>Chargement...</Typography>
      </Box>
    );
  }

  const isAdmin = user?.is_superuser || user?.is_staff;
  if (!isAdmin) { navigate("/admin_dashboard"); return null; }

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

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          minHeight: "100vh",
          bgcolor: "black",
          overflowY: "auto",
          overflowX: "hidden",
          "&::-webkit-scrollbar": { width: "8px" },
          "&::-webkit-scrollbar-track": { bgcolor: "rgba(15, 23, 42, 0.4)" },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "rgba(59, 130, 246, 0.3)",
            borderRadius: "4px",
            "&:hover": { bgcolor: "rgba(59, 130, 246, 0.5)" },
          },
        }}
      >
        {/* Header */}
        <Box sx={{ p: 1.2, borderBottom: "1px solid rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          {isMobile && (
            <IconButton onClick={handleDrawerToggle} sx={{ color: "white", mr: 1, "&:hover": { bgcolor: "rgba(59, 130, 246, 0.1)" } }}>
              <MenuIcon />
            </IconButton>
          )}

          {/* Search */}
          <Box sx={{ flex: 1, maxWidth: 500, position: "relative" }}>
          <SearchIcon sx={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#64748b", fontSize: 20 }} />
            <input
              type="text"
              placeholder="Rechercher dans le dashboard..."
              style={{
                width: "100%", padding: "12px 16px 12px 48px",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                borderRadius: "12px", color: "#94a3b8", fontSize: "0.9rem", outline: "none",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.backgroundColor = "rgba(59, 130, 246, 0.2)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(59, 130, 246, 0.2)"; e.target.style.backgroundColor = "rgba(59, 130, 246, 0.1)"; }}
            />
          </Box>

          {/* Right actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Badge badgeContent={unreadNotifications.length} color="error">
              <IconButton onClick={handleOpenNotifications} sx={{ color: "#64748b", "&:hover": { bgcolor: "rgba(59, 130, 246, 0.1)" } }}>
                <NotificationsIcon />
              </IconButton>
            </Badge>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
                <Typography variant="body2" sx={{ color: "white", fontWeight: 600, fontSize: "0.9rem" }}>
                  {user?.first_name || user?.username}
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.75rem" }}>
                  {isAdmin ? "Administrateur" : "Utilisateur"}
                </Typography>
              </Box>
              <Avatar sx={{ width: 40, height: 40, bgcolor: isAdmin ? "#ef4444" : "#3b82f6", fontWeight: 600, fontSize: "1rem" }}>
                {user?.first_name?.charAt(0) || user?.username?.charAt(0) || "U"}
              </Avatar>
            </Box>
          </Box>
        </Box>

        {/* Page title */}
        <Box sx={{ p: 3, pb: 0 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ color: "white", fontWeight: 700, mb: 0.5 }}>
                Tableau de Bord Administrateur
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.95rem" }}>
                Gestion complète du système et surveillance
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Dashboard content */}
        <Box sx={{ p: 3, pt: 2, pb: 6 }}>

          {/* Stats cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Alertes Actives */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: 3, transition: "all 0.3s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 24px rgba(239, 68, 68, 0.2)" } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
                    <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>Alertes Actives</Typography>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "rgba(239, 68, 68, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <WarningIcon sx={{ color: "#ef4444", fontSize: 20 }} />
                    </Box>
                  </Box>
                  <Typography variant="h3" sx={{ color: "white", fontWeight: 700, mb: 1 }}>{dashboardData.stats.activeAlerts}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ErrorIcon sx={{ color: "#ef4444", fontSize: 16 }} />
                    <Typography variant="caption" sx={{ color: "#ef4444", fontSize: "0.8rem", fontWeight: 500 }}>Nécessite attention</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Notifications Totales */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: 3, transition: "all 0.3s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 24px rgba(59, 130, 246, 0.2)" } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
                    <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>Notifications Totales</Typography>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "rgba(59, 130, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <NotificationsIcon sx={{ color: "#3b82f6", fontSize: 20 }} />
                    </Box>
                  </Box>
                  <Typography variant="h3" sx={{ color: "white", fontWeight: 700, mb: 1 }}>{notificationsData.length.toLocaleString()}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TrendingUpIcon sx={{ color: "#10b981", fontSize: 16 }} />
                    <Typography variant="caption" sx={{ color: "#10b981", fontSize: "0.8rem", fontWeight: 500 }}>
                      {unreadNotifications.length} non lues
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Alertes Résolues */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: "rgba(16, 185, 129, 0.1)", border: "1px solid #10B98133", borderRadius: 3, transition: "all 0.3s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 24px rgba(16, 185, 129, 0.2)" } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
                    <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>Alertes Résolues</Typography>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "rgba(16, 185, 129, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CheckCircleIcon sx={{ color: "#10b981", fontSize: 20 }} />
                    </Box>
                  </Box>
                  <Typography variant="h3" sx={{ color: "white", fontWeight: 700, mb: 1 }}>{dashboardData.stats.resolvedAlerts}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TrendingUpIcon sx={{ color: "#10b981", fontSize: 16 }} />
                    <Typography variant="caption" sx={{ color: "#10b981", fontSize: "0.8rem", fontWeight: 500 }}>Alertes résolues</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Utilisateurs Totaux */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.2)", borderRadius: 3, transition: "all 0.3s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 24px rgba(139, 92, 246, 0.2)" } }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
                    <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>Utilisateurs Totaux</Typography>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "rgba(139, 92, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <PeopleIcon sx={{ color: "#8b5cf6", fontSize: 20 }} />
                    </Box>
                  </Box>
                  <Typography variant="h3" sx={{ color: "white", fontWeight: 700, mb: 1 }}>{dashboardData.stats.totalUsers || 0}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PeopleIcon sx={{ color: "#8b5cf6", fontSize: 16 }} />
                    <Typography variant="caption" sx={{ color: "#8b5cf6", fontSize: "0.8rem", fontWeight: 500 }}>
                      {dashboardData.stats.activeUsers || 0} actifs
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts row */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* ✅ Activité des notifications - Area Chart */}
            <Grid item xs={12} lg={8}>
              <Card sx={{ bgcolor: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(59, 130, 246, 0.1)", borderRadius: 3, height: "100%" }}>
                <CardContent sx={{ p: 3, height: "100%" }}>
                  <NotificationActivityChart />
                </CardContent>
              </Card>
            </Grid>

            {/* Répartition des alertes */}
            <Grid item xs={12} lg={4}>
              <Card sx={{ bgcolor: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(59, 130, 246, 0.1)", borderRadius: 3, height: "100%" }}>
                <CardContent sx={{ p: 3, height: "100%" }}>
                  <Typography variant="h6" sx={{ color: "white", fontWeight: 600, mb: 3 }}>Répartition des alertes</Typography>
                  <Box sx={{ height: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
                    {moduleDistribution.total > 0 ? (
                      <>
                        <Box sx={{
                          width: 180, height: 180, borderRadius: "50%",
                          background: `conic-gradient(${moduleConicGradient})`,
                          position: "relative",
                          boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
                          animation: "alertDonutIn 0.8s ease-out",
                          "@keyframes alertDonutIn": { "0%": { transform: "scale(0.85)", opacity: 0 }, "100%": { transform: "scale(1)", opacity: 1 } },
                        }}>
                          <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 110, height: 110, borderRadius: "50%", bgcolor: "rgba(15, 23, 42, 0.95)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                            <Typography sx={{ color: "white", fontWeight: 700, fontSize: "1.5rem" }}>{moduleDistribution.items.length}</Typography>
                            <Typography sx={{ color: "#94a3b8", fontSize: "0.75rem" }}>modules</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
                          {moduleDistributionItems.map((item) => (
                            <Box key={item.key} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: item.color }} />
                              <Typography sx={{ color: "#94a3b8", fontSize: "0.8rem" }}>{item.label} ({item.percent}%)</Typography>
                            </Box>
                          ))}
                        </Box>
                      </>
                    ) : (
                      <Typography sx={{ color: "#64748b", textAlign: "center", py: 4 }}>Aucune donnée disponible</Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Bottom row */}
          <Grid container spacing={3}>
            {/* Activités récentes - Timeline */}
            <Grid item xs={12} lg={6}>
              <Card sx={{ bgcolor: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(59, 130, 246, 0.1)", borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ color: "white", fontWeight: 600, mb: 0.5 }}>Mes activités récentes</Typography>
                    <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.875rem" }}>Ce que vous avez fait récemment</Typography>
                  </Box>
                  <Box sx={{ position: "relative", pl: 4 }}>
                    <Box sx={{ position: "absolute", left: "18px", top: "12px", bottom: "12px", width: "2px", bgcolor: "rgba(59, 130, 246, 0.2)" }} />
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      {dashboardData.recentActivity.length > 0 ? (
                        dashboardData.recentActivity.map((activity) => (
                          <Box key={activity.id} sx={{ position: "relative", transition: "all 0.2s ease", "&:hover": { transform: "translateX(4px)" } }}>
                            <Box sx={{ position: "absolute", left: "-34px", top: "2px", width: 36, height: 36, borderRadius: "50%", bgcolor: `${activity.color}15`, border: `2px solid ${activity.color}`, display: "flex", alignItems: "center", justifyContent: "center", color: activity.color, zIndex: 1 }}>
                              {getActivityIcon(activity.icon)}
                            </Box>
                            <Box>
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                                <Typography variant="subtitle2" sx={{ color: "white", fontWeight: 600, fontSize: "0.9rem" }}>{activity.title}</Typography>
                                <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.75rem", whiteSpace: "nowrap", ml: 2 }}>{activity.time}</Typography>
                              </Box>
                              <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>{activity.description}</Typography>
                            </Box>
                          </Box>
                        ))
                      ) : (
                        <Box sx={{ textAlign: "center", py: 6 }}>
                          <NotificationsIcon sx={{ fontSize: 48, color: "#64748b", mb: 2 }} />
                          <Typography variant="body1" sx={{ color: "#94a3b8", mb: 1 }}>Aucune activité récente</Typography>
                          <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.85rem" }}>Vos actions apparaîtront ici</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Alertes récentes */}
            <Grid item xs={12} lg={6}>
              <Card sx={{ bgcolor: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(59, 130, 246, 0.1)", borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>Alertes Récentes</Typography>
                    <Badge badgeContent={dashboardData.stats.activeAlerts} color="error">
                      <Button size="small" startIcon={<DownloadIcon />} onClick={handleExportData} sx={{ color: "#3b82f6", textTransform: "none", fontSize: "0.875rem" }}>
                        Exporter
                      </Button>
                    </Badge>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {dashboardData.alerts && dashboardData.alerts.length > 0 ? (
                      dashboardData.alerts.slice(0, 4).map((alert) => (
                        <Paper key={alert.id} sx={{
                          p: 2, bgcolor: "rgba(30, 41, 59, 0.3)", border: "1px solid",
                          borderColor: alert.type === "critical" ? "rgba(239, 68, 68, 0.2)" : alert.type === "warning" ? "rgba(251, 146, 60, 0.2)" : "rgba(59, 130, 246, 0.2)",
                          borderRadius: 2, transition: "all 0.2s ease",
                          "&:hover": { transform: "translateX(4px)", borderColor: alert.type === "critical" ? "#ef4444" : alert.type === "warning" ? "#f59e0b" : "#3b82f6" },
                        }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <Box>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                {getStatusIcon(alert.type)}
                                <Typography variant="subtitle2" sx={{ color: "white", fontWeight: 600 }}>{alert.module || "Système"}</Typography>
                                <Chip label={alert.type === "critical" ? "Critique" : alert.type === "warning" ? "Avertissement" : "Info"} size="small" color={getStatusColor(alert.type)} sx={{ height: 20, fontSize: "0.65rem" }} />
                              </Box>
                              <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1 }}>{alert.message || "Alerte système"}</Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: "#64748b" }}>{alert.time || "Récemment"}</Typography>
                          </Box>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                            <Typography variant="caption" sx={{ color: "#64748b" }}>
                              Status: {alert.status === "active" ? "Actif" : "Résolu"}
                            </Typography>
                            <Button size="small" onClick={() => handleViewAlertDetails(alert)} sx={{ fontSize: "0.75rem", color: "#3b82f6", "&:hover": { bgcolor: "rgba(59, 130, 246, 0.1)" } }}>
                              Voir les détails
                            </Button>
                          </Box>
                        </Paper>
                      ))
                    ) : (
                      <Typography sx={{ color: "#64748b", textAlign: "center", py: 4 }}>Aucune alerte récente</Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Context menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} PaperProps={{ sx: { bgcolor: "#1e293b", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: 2, minWidth: 180 } }}>
        <MenuItem onClick={handleEditUser} sx={{ color: "#94a3b8", "&:hover": { bgcolor: "rgba(59, 130, 246, 0.1)" } }}>
          <EditIcon sx={{ mr: 1, fontSize: 20, color: "#3b82f6" }} /> Modifier
        </MenuItem>
        <MenuItem onClick={handleDeleteUser} sx={{ color: "#94a3b8", "&:hover": { bgcolor: "rgba(59, 130, 246, 0.1)" } }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20, color: "#ef4444" }} /> Supprimer
        </MenuItem>
      </Menu>

      {/* Alert details dialog */}
      <Dialog open={alertDetailsOpen} onClose={handleCloseAlertDetails} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: "black", border: "1px solid #3B82F633", borderRadius: 3 } }}>
        <DialogTitle sx={{ color: "white", borderBottom: "1px solid rgba(59, 130, 246, 0.1)", pb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: selectedAlert?.type === "critical" ? "rgba(239, 68, 68, 0.15)" : "rgba(59, 130, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {getStatusIcon(selectedAlert?.type)}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>Détails de l'alerte</Typography>
              <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.875rem" }}>{selectedAlert?.module || "Système"}</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedAlert && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box>
                <Typography variant="caption" sx={{ color: "white", display: "block", mb: 1 }}>Type et statut</Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip label={selectedAlert.type === "critical" ? "Critique" : selectedAlert.type === "warning" ? "Avertissement" : "Info"} color={getStatusColor(selectedAlert.type)} sx={{ fontWeight: 600 }} />
                  <Chip label={selectedAlert.status === "active" ? "Actif" : "Résolu"} variant="outlined" sx={{ fontWeight: 600, color: "white", borderColor: "rgba(59,130,246,0.4)" }} />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "#64748b", display: "block", mb: 1 }}>Message</Typography>
                <Paper sx={{ p: 2, bgcolor: "rgba(30, 41, 59, 0.3)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: 2 }}>
                  <Typography sx={{ color: "#94a3b8" }}>{selectedAlert.message || "Alerte système"}</Typography>
                </Paper>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "#64748b", display: "block", mb: 1.5 }}>Informations détaillées</Typography>
                <Grid container spacing={2}>
                  {[
                    { label: "Module", value: selectedAlert.module || "N/A" },
                    { label: "Date/Heure", value: selectedAlert.time || "Récemment" },
                    { label: "ID Alerte", value: `#${selectedAlert.id || "N/A"}`, mono: true },
                    { label: "Priorité", value: selectedAlert.type === "critical" ? "Haute" : selectedAlert.type === "warning" ? "Moyenne" : "Basse" },
                  ].map(({ label, value, mono }) => (
                    <Grid item xs={6} key={label}>
                      <Box sx={{ p: 2, bgcolor: "rgba(30, 41, 59, 0.3)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: "#64748b", display: "block", mb: 0.5 }}>{label}</Typography>
                        <Typography sx={{ color: "white", fontWeight: 600, fontFamily: mono ? "monospace" : "inherit" }}>{value}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "#64748b", display: "block", mb: 1 }}>Actions recommandées</Typography>
                <Alert severity={selectedAlert.type === "critical" ? "error" : selectedAlert.type === "warning" ? "warning" : "info"}>
                  {selectedAlert.type === "critical"
                    ? "Action immédiate requise - Vérifiez les logs système et contactez l'équipe technique."
                    : selectedAlert.type === "warning"
                    ? "Surveillance recommandée - Vérifiez les métriques et planifiez une intervention si nécessaire."
                    : "Notification informative - Aucune action immédiate requise."}
                </Alert>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid rgba(59, 130, 246, 0.1)" }}>
          <Button onClick={handleCloseAlertDetails} sx={{ color: "#94a3b8", "&:hover": { bgcolor: "rgba(59, 130, 246, 0.1)" } }}>Fermer</Button>
          <Button variant="contained" sx={{ bgcolor: "#3b82f6", color: "white", fontWeight: 600, "&:hover": { bgcolor: "#2563eb" } }} onClick={() => { handleCloseAlertDetails(); setSuccessMessage("Alerte marquée comme traitée"); }}>
            Marquer comme traitée
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications menu */}
      <Menu anchorEl={notificationsAnchorEl} open={Boolean(notificationsAnchorEl)} onClose={handleCloseNotifications} PaperProps={{ sx: { mt: 1, width: 360, bgcolor: "#0f172a", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: 2, overflow: "hidden" } }}>
        <Box sx={{ p: 2, borderBottom: "1px solid rgba(59, 130, 246, 0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ color: "white", fontWeight: 700 }}>Notifications</Typography>
          <Button size="small" onClick={handleMarkAllNotificationsRead} sx={{ color: "#3b82f6", textTransform: "none", fontSize: "0.75rem" }}>Tout marquer comme lu</Button>
        </Box>
        <Box sx={{ maxHeight: 360, overflowY: "auto" }}>
          {unreadNotifications.length > 0 ? (
            unreadNotifications.slice(0, 6).map((notif) => (
              <Box key={notif.id} sx={{ px: 2, py: 1.5, display: "flex", gap: 1.5, borderBottom: "1px solid rgba(59, 130, 246, 0.08)" }}>
                <Box sx={{ pt: 0.6 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: getNotificationDotColor(notif) }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                    <Typography sx={{ color: "white", fontWeight: 600, fontSize: "0.9rem" }}>{notif.title}</Typography>
                    <Typography sx={{ color: "#94a3b8", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{formatRelativeTime(notif.created_at)}</Typography>
                  </Box>
                  <Typography sx={{ color: "#94a3b8", fontSize: "0.8rem" }}>{notif.message}</Typography>
                </Box>
              </Box>
            ))
          ) : (
            <Box sx={{ p: 2 }}>
              <Typography sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>Aucune notification non lue</Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ p: 1.5, borderTop: "1px solid rgba(59, 130, 246, 0.1)", textAlign: "center" }}>
          <Button size="small" onClick={() => { handleCloseNotifications(); navigate("/notifications"); }} sx={{ color: "#3b82f6", textTransform: "none", fontSize: "0.85rem" }}>
            Voir toutes les notifications
          </Button>
        </Box>
      </Menu>

      {/* Delete dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { bgcolor: "#1e293b", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: 3 } }}>
        <DialogTitle sx={{ color: "white", borderBottom: "1px solid rgba(239, 68, 68, 0.1)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ErrorIcon sx={{ color: "#ef4444" }} /> Confirmer la suppression
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography sx={{ color: "#94a3b8", mb: 2 }}>
            Êtes-vous sûr de vouloir supprimer l'utilisateur <strong style={{ color: "white" }}>{selectedUser?.name}</strong> ?
          </Typography>
          <Alert severity="warning" sx={{ bgcolor: "rgba(251, 146, 60, 0.1)", border: "1px solid rgba(251, 146, 60, 0.2)" }}>
            Cette action est irréversible. Toutes les données associées seront également supprimées.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid rgba(239, 68, 68, 0.1)" }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: "#94a3b8", "&:hover": { bgcolor: "rgba(59, 130, 246, 0.1)" } }}>Annuler</Button>
          <Button onClick={confirmDeleteUser} variant="contained" sx={{ bgcolor: "#ef4444", color: "white", fontWeight: 600, "&:hover": { bgcolor: "#dc2626" } }}>Supprimer</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars */}
      <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={() => setSuccessMessage("")} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert severity="success" sx={{ width: "100%" }}>{successMessage}</Alert>
      </Snackbar>
      <Snackbar open={!!errorMessage} autoHideDuration={3000} onClose={() => setErrorMessage("")} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert severity="error" sx={{ width: "100%" }}>{errorMessage}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;