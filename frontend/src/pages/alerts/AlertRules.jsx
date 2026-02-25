import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
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
  Menu,
  MenuItem,
  Divider,
  Badge,
} from "@mui/material";
import { CiFilter } from "react-icons/ci";
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
  CalendarToday as CalendarTodayIcon,
  Category as CategoryIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import SharedSidebar from "../../components/SharedSidebar";

const AlertRules = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("all");
  const [filterModule, setFilterModule] = useState("all");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const moduleIcons = {
    stock: <InventoryIcon />,
    crm: <PeopleIcon />,
    facturation: <DescriptionIcon />,
    gmao: <SettingsIcon />,
    gpao: <AssessmentIcon />,
    rh: <PeopleIcon />,
  };

  const modules = [
    { value: "stock", label: "Stock" },
    { value: "crm", label: "CRM" },
    { value: "facturation", label: "Facturation" },
    { value: "gmao", label: "GMAO" },
    { value: "gpao", label: "GPAO" },
    { value: "rh", label: "Ressources Humaines" },
  ];

  const dateOptions = [
    { value: "all", label: "Toutes les dates" },
    { value: "today", label: "Aujourd'hui" },
    { value: "this_week", label: "Cette semaine" },
    { value: "this_month", label: "Ce mois" },
  ];

  const activeFiltersCount =
    (filterDate !== "all" ? 1 : 0) + (filterModule !== "all" ? 1 : 0);

  const getOperatorSymbol = (operator) => {
    switch (operator) {
      case "=": return "=";
      case ">": return ">";
      case "<": return "<";
      case "!=": return "≠";
      case ">=": return "≥";
      case "<=": return "≤";
      case "greater_than": return ">";
      case "less_than": return "<";
      case "equal_to": return "=";
      case "not_equal": return "≠";
      default: return operator;
    }
  };

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const endpoint = "http://localhost:8000/api/alerts/";
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Erreur lors du chargement des alertes");
      let alertsData = await response.json();
      
      // Admin voit UNIQUEMENT ses propres alertes (même logique que Notifications)
      // Note: user est un ID simple, pas un objet
      if (user?.is_superuser && Array.isArray(alertsData)) {
        alertsData = alertsData.filter(a => a.user === user.id);
      }
      
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
    } catch (err) {
      console.error("Erreur fetchAlerts:", err);
      setErrorMessage("Erreur lors du chargement des alertes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchAlerts(); }, [user]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleDeleteAlert = async () => {
    if (!selectedAlert) return;
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://localhost:8000/api/alerts/${selectedAlert.id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Erreur");
      setAlerts((prev) => prev.filter((a) => a.id !== selectedAlert.id));
      setSuccessMessage("Alerte supprimée avec succès");
    } catch {
      setErrorMessage("Erreur lors de la suppression");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedAlert(null);
    }
  };

  const handleToggleStatus = async (alert, event) => {
    event.stopPropagation();
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://localhost:8000/api/alerts/${alert.id}/toggle_active/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Erreur");
      const result = await response.json();
      setAlerts((prev) => prev.map((a) => a.id === alert.id ? { ...a, is_active: !a.is_active } : a));
      setSuccessMessage(`Alerte ${result.alert.is_active ? "activée" : "désactivée"} avec succès`);
    } catch {
      setErrorMessage("Erreur lors du changement de statut");
    }
  };

  const handleRefresh = () => { fetchAlerts(); setSuccessMessage("Liste actualisée"); };

  const getFilteredAlerts = () => {
    let filtered = [...alerts];
    if (filterModule !== "all") filtered = filtered.filter((a) => a.module === filterModule);
    if (filterDate !== "all") {
      const now = new Date();
      filtered = filtered.filter((alert) => {
        const aDate = new Date(alert.created_at);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth() - 1);
        if (filterDate === "today") return aDate >= today;
        if (filterDate === "this_week") return aDate >= weekAgo;
        if (filterDate === "this_month") return aDate >= monthAgo;
        return true;
      });
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((a) =>
        a.name?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.module?.toLowerCase().includes(q) ||
        a.user?.username?.toLowerCase().includes(q) ||
        a.user?.email?.toLowerCase().includes(q)
      );
    }
    return filtered;
  };

  const filteredAlerts = getFilteredAlerts();

  const getSeverityColor = (s) => ({ critical: "#ef4444", high: "#f59e0b", medium: "#3b82f6", low: "#10b981" }[s] || "#64748b");
  const getSeverityLabel = (s) => ({ critical: "Critique", high: "Haute", medium: "Moyenne", low: "Basse" }[s] || s);

  if (!user) return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", bgcolor: "black" }}>
      <Typography variant="h4" sx={{ color: "white" }}>Chargement...</Typography>
    </Box>
  );

  if (loading) return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", bgcolor: "black" }}>
      <CircularProgress sx={{ color: "#3b82f6" }} />
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "black" }}>
      <SharedSidebar mobileOpen={mobileOpen} onMobileClose={handleDrawerToggle} />

      <Box component="main" sx={{ flexGrow: 1, width: "100%", minHeight: "100vh", bgcolor: "black", overflowY: "auto" }}>

        {/* En-tête */}
        <Box sx={{ p: 1.2, borderBottom: "1px solid rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          {isMobile && (
            <IconButton onClick={handleDrawerToggle} sx={{ color: "white" }}>
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: "auto" }}>
            <IconButton onClick={handleRefresh} sx={{ color: "#64748b" }}>
              <RefreshIcon />
            </IconButton>
            <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" sx={{ color: "white", fontWeight: 600 }}>{user?.first_name || user?.username}</Typography>
              <Typography variant="caption" sx={{ color: "#64748b" }}>{user?.is_superuser ? "Administrateur" : "Utilisateur"}</Typography>
            </Box>
            <Avatar sx={{ width: 40, height: 40, bgcolor: user?.is_superuser ? "#ef4444" : "#3b82f6" }}>
              {user?.first_name?.charAt(0) || user?.username?.charAt(0) || "U"}
            </Avatar>
          </Box>
        </Box>

        <Box sx={{ p: 3, pb: 0 }}>
          {/* Titre + bouton créer */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ color: "white", fontWeight: 700, mb: 0.5 }}>
                {user?.is_superuser ? "Toutes les Alertes" : "Mes Alertes"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                {user?.is_superuser ? "Consultez et gérez toutes les alertes du système" : "Consultez et gérez toutes vos alertes "}
              </Typography>
            </Box>
            <Button
              variant="contained" startIcon={<AddIcon />}
              onClick={() => navigate("/new-alert")}
              sx={{ bgcolor: "#3b82f6", color: "white", fontWeight: 600, py: 1.2, px: 3, borderRadius: 2, textTransform: "none", fontSize: "0.95rem", boxShadow: "0 4px 12px rgba(59,130,246,0.3)", "&:hover": { bgcolor: "#2563eb" } }}
            >
              Créer une nouvelle alerte
            </Button>
          </Box>

          {/* Icône filtre + barre de recherche */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: activeFiltersCount > 0 ? 1.5 : 3 }}>
            <Tooltip title="Filtres avancés">
              <Badge badgeContent={activeFiltersCount} sx={{ "& .MuiBadge-badge": { bgcolor: "#3b82f6", color: "white", fontSize: "0.65rem", minWidth: 16, height: 16 } }}>
                <IconButton
                  onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                  sx={{
                    color: activeFiltersCount > 0 ? "#3b82f6" : "#64748b",
                    bgcolor: activeFiltersCount > 0 ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.05)",
                    border: activeFiltersCount > 0 ? "1px solid rgba(59,130,246,0.4)" : "1px solid rgba(59,130,246,0.15)",
                    borderRadius: "10px", width: 44, height: 44, flexShrink: 0,
                    "&:hover": { bgcolor: "rgba(59,130,246,0.15)" },
                  }}
                >
                  <CiFilter size={22} />
                </IconButton>
              </Badge>
            </Tooltip>

            <Box sx={{ flex: 1, position: "relative" }}>
              <SearchIcon sx={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#64748b", fontSize: 20 }} />
              <input
                type="text"
                placeholder="Rechercher une alerte par nom, module, utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%", padding: "12px 16px 12px 48px",
                  backgroundColor: "rgba(59,130,246,0.08)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  borderRadius: "10px", color: "#94a3b8", fontSize: "0.9rem",
                  outline: "none", boxSizing: "border-box",
                }}
              />
            </Box>
          </Box>

          {/* Chips filtres actifs */}

          {activeFiltersCount > 0 && (
            <Box sx={{ display: "flex", gap: 1, mb: 2.5, flexWrap: "wrap", alignItems: "center" }}>
              {filterDate !== "all" && (
                <Chip
                  label={dateOptions.find((d) => d.value === filterDate)?.label}
                  onDelete={() => setFilterDate("all")} size="small"
                  sx={{ bgcolor: "rgba(59,130,246,0.15)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.3)", fontWeight: 500 }}
                />
              )}
              {filterModule !== "all" && (
                <Chip
                  label={modules.find((m) => m.value === filterModule)?.label}
                  onDelete={() => setFilterModule("all")} size="small"
                  sx={{ bgcolor: "rgba(59,130,246,0.15)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.3)", fontWeight: 500 }}
                />
              )}
              <Button
                size="small"
                onClick={() => { setFilterDate("all"); setFilterModule("all"); }}
                sx={{ color: "#64748b", fontSize: "0.75rem", textTransform: "none", py: 0, minHeight: 0, "&:hover": { color: "#ef4444" } }}
              >
                Tout effacer
              </Button>
            </Box>
          )}
        </Box>

        {/* Menu filtre */}
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={() => setFilterAnchorEl(null)}
          PaperProps={{
            sx: {
              bgcolor: "rgba(15,23,42,0.97)", border: "1px solid rgba(59,130,246,0.2)",
              borderRadius: "12px", backdropFilter: "blur(12px)",
              minWidth: 260, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", mt: 0.5,
            },
          }}
        >
          <Box sx={{ px: 2, pt: 1.5, pb: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarTodayIcon sx={{ fontSize: 14, color: "#3b82f6" }} />
            <Typography variant="caption" sx={{ color: "#3b82f6", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, fontSize: "0.7rem" }}>
              Date de création
            </Typography>
          </Box>
          {dateOptions.map((opt) => (
            <MenuItem key={opt.value} onClick={() => setFilterDate(opt.value)}
              sx={{ px: 2, py: 0.8, color: filterDate === opt.value ? "#3b82f6" : "#94a3b8", bgcolor: filterDate === opt.value ? "rgba(59,130,246,0.1)" : "transparent", fontSize: "0.875rem", display: "flex", justifyContent: "space-between", alignItems: "center", "&:hover": { bgcolor: "rgba(59,130,246,0.08)", color: "white" } }}
            >
              {opt.label}
              {filterDate === opt.value && <CheckIcon sx={{ fontSize: 16, color: "#3b82f6" }} />}
            </MenuItem>
          ))}

          <Divider sx={{ borderColor: "rgba(59,130,246,0.15)", my: 1 }} />

          <Box sx={{ px: 2, pt: 0.5, pb: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
            <CategoryIcon sx={{ fontSize: 14, color: "#3b82f6" }} />
            <Typography variant="caption" sx={{ color: "#3b82f6", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, fontSize: "0.7rem" }}>
              Module
            </Typography>
          </Box>
          <MenuItem onClick={() => setFilterModule("all")}
            sx={{ px: 2, py: 0.8, color: filterModule === "all" ? "#3b82f6" : "#94a3b8", bgcolor: filterModule === "all" ? "rgba(59,130,246,0.1)" : "transparent", fontSize: "0.875rem", display: "flex", justifyContent: "space-between", alignItems: "center", "&:hover": { bgcolor: "rgba(59,130,246,0.08)", color: "white" } }}
          >
            Tous les modules
            {filterModule === "all" && <CheckIcon sx={{ fontSize: 16, color: "#3b82f6" }} />}
          </MenuItem>
          {modules.map((mod) => (
            <MenuItem key={mod.value} onClick={() => setFilterModule(mod.value)}
              sx={{ px: 2, py: 0.8, color: filterModule === mod.value ? "#3b82f6" : "#94a3b8", bgcolor: filterModule === mod.value ? "rgba(59,130,246,0.1)" : "transparent", fontSize: "0.875rem", display: "flex", justifyContent: "space-between", alignItems: "center", "&:hover": { bgcolor: "rgba(59,130,246,0.08)", color: "white" } }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ color: "rgba(255,255,255,0.4)", display: "flex", "& svg": { fontSize: 16 } }}>{moduleIcons[mod.value]}</Box>
                {mod.label}
              </Box>
              {filterModule === mod.value && <CheckIcon sx={{ fontSize: 16, color: "#3b82f6" }} />}
            </MenuItem>
          ))}

          {activeFiltersCount > 0 && (
            <>
              <Divider sx={{ borderColor: "rgba(59,130,246,0.15)", mt: 1 }} />
              <Box sx={{ p: 1.5 }}>
                <Button fullWidth size="small"
                  onClick={() => { setFilterDate("all"); setFilterModule("all"); setFilterAnchorEl(null); }}
                  sx={{ color: "#ef4444", fontSize: "0.8rem", textTransform: "none", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", "&:hover": { bgcolor: "rgba(239,68,68,0.08)" } }}
                >
                  Réinitialiser les filtres
                </Button>
              </Box>
            </>
          )}
        </Menu>

        {/* Table */}
        <Box sx={{ p: 3, pt: 0 }}>
          <Card sx={{ bgcolor: "rgba(30,41,59,0.5)", border: "1px solid rgba(59,130,246,0.1)", borderRadius: 3 }}>
            {filteredAlerts.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "rgba(59,130,246,0.05)", borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
                      {["Règle", "Module", "Priorité", "Statut", "Fréquence", "Condition", "Date de création"].map((h) => (
                        <TableCell key={h} sx={{ color: "#94a3b8", fontWeight: 600 }}>{h}</TableCell>
                      ))}
                      <TableCell align="right" sx={{ color: "#94a3b8", fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAlerts.map((alert) => (
                      <TableRow key={alert.id} sx={{ borderBottom: "1px solid rgba(59,130,246,0.1)", "&:hover": { bgcolor: "rgba(59,130,246,0.05)" } }}>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Avatar sx={{ bgcolor: getSeverityColor(alert.severity) }}>
                              <NotificationsActiveIcon fontSize="small" />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ color: "white", fontWeight: 600 }}>{alert.name}</Typography>
                              <Typography variant="caption" sx={{ color: "#64748b" }}>
                                {alert.description?.substring(0, 50)}{alert.description?.length > 50 ? "..." : ""}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box sx={{ color: "rgba(255,255,255,0.7)" }}>{moduleIcons[alert.module] || <SettingsIcon />}</Box>
                            <Typography variant="body2" sx={{ color: "#94a3b8" }}>{modules.find((m) => m.value === alert.module)?.label || alert.module}</Typography>
                          </Box>
                        </TableCell>
                       
                        <TableCell>
                          <Chip label={getSeverityLabel(alert.severity)} size="small" sx={{ bgcolor: `${getSeverityColor(alert.severity)}20`, color: getSeverityColor(alert.severity), fontWeight: 600, fontSize: "0.75rem" }} />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Switch checked={alert.is_active || false} onChange={(e) => handleToggleStatus(alert, e)} size="small"
                              sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#10b981" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#10b981" } }}
                            />
                            <Typography variant="caption" sx={{ color: alert.is_active ? "#10b981" : "#ef4444", ml: 1 }}>
                              {alert.is_active ? "Actif" : "Inactif"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                            {{ immediate: "Immédiat", daily: "Quotidien", weekly: "Hebdomadaire", monthly: "Mensuel", hourly: "Toutes les heures" }[alert.schedule] || alert.schedule}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {alert.condition_type === "threshold" && alert.threshold_value ? (
                            <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.75rem", whiteSpace: "nowrap" }}>Seuil {getOperatorSymbol(alert.comparison_operator)} {alert.threshold_value}</Typography>
                          ) : alert.condition_type === "absence" && alert.threshold_value ? (
                            <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.75rem", whiteSpace: "nowrap" }}>Pas de données &gt; {alert.threshold_value}min</Typography>
                          ) : alert.condition_type === "anomaly" && alert.threshold_value ? (
                            <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.75rem", whiteSpace: "nowrap" }}>Anomalie ±{alert.threshold_value}σ</Typography>
                          ) : alert.condition_type === "trend" && alert.threshold_value ? (
                            <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.75rem", whiteSpace: "nowrap" }}>Tendance +{alert.threshold_value}%</Typography>
                          ) : (
                            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.75rem" }}>Aucune condition</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                            {alert.created_at ? new Date(alert.created_at).toLocaleDateString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit" }) : "-"}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.75rem", display: "block", mt: 0.5 }}>
                            {alert.created_at ? new Date(alert.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : ""}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                            <Tooltip title="Modifier">
                              <IconButton size="small" onClick={() => navigate(`/edit-alert/${alert.id}`)} sx={{ color: "#3b82f6" }}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton size="small" onClick={() => { setSelectedAlert(alert); setDeleteDialogOpen(true); }} sx={{ color: "#ef4444" }}>
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
                <Typography variant="h6" sx={{ color: "white", mb: 1 }}>Aucune règle d'alerte</Typography>
                <Typography sx={{ color: "#64748b", mb: 3, maxWidth: 400, mx: "auto" }}>
                  {searchTerm || activeFiltersCount > 0 ? "Aucune alerte ne correspond à vos filtres" : "Commencez par créer votre première règle d'alerte pour surveiller vos données ERP."}
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/new-alert")} sx={{ bgcolor: "#3b82f6", color: "white", textTransform: "none" }}>
                  Créer une alerte
                </Button>
              </CardContent>
            )}
          </Card>
        </Box>
      </Box>

      {/* Dialog suppression */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { bgcolor: "#1e293b", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 3 } }}>
        <DialogTitle sx={{ color: "white", borderBottom: "1px solid rgba(239,68,68,0.1)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <DeleteIcon sx={{ color: "#ef4444" }} /> Supprimer l'alerte
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography sx={{ color: "#94a3b8", mb: 2 }}>
            Êtes-vous sûr de vouloir supprimer l'alerte <strong style={{ color: "white" }}>{selectedAlert?.name}</strong> ?
          </Typography>
          <Alert severity="warning" sx={{ bgcolor: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.2)" }}>Cette action est irréversible.</Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid rgba(239,68,68,0.1)" }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: "#94a3b8" }}>Annuler</Button>
          <Button onClick={handleDeleteAlert} variant="contained" sx={{ bgcolor: "#ef4444", "&:hover": { bgcolor: "#dc2626" } }}>Supprimer</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={() => setSuccessMessage("")} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert severity="success" sx={{ width: "100%" }}>{successMessage}</Alert>
      </Snackbar>
      <Snackbar open={!!errorMessage} autoHideDuration={3000} onClose={() => setErrorMessage("")} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert severity="error" sx={{ width: "100%" }}>{errorMessage}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AlertRules;
