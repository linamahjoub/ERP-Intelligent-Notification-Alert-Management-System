import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
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
  Chip,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  InputAdornment,
  Badge,
  Tooltip,
  Divider,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Business as BusinessIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Menu as MenuIcon,
  Check as CheckIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { CiFilter } from "react-icons/ci";
import SharedSidebar from "../../components/SharedSidebar";

/* ─── StatCard ───────────────────────────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, color, onClick }) => {
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <Card
      onClick={onClick}
      sx={{
        bgcolor: hexToRgba(color, 0.1),
        border: `1px solid ${hexToRgba(color, 0.2)}`,
        borderRadius: 3,
        transition: "all 0.3s ease",
        cursor: onClick ? "pointer" : "default",
        minHeight: 110,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 8px 24px ${hexToRgba(color, 0.2)}`,
        },
      }}
    >
      <CardContent sx={{ py: 2, px: 2.5, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <Typography variant="body2" sx={{ color: "#94a3b8", mb: 0.5, fontSize: "0.85rem" }}>
          {label}
        </Typography>
        <Typography variant="h5" sx={{ color: "white", fontWeight: 700 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

const Fournisseur = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // Ajouter le state pour le filtre
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    contact_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    is_active: true,
  });

  const [suppliers, setSuppliers] = useState([]);

  const API_BASE = "http://localhost:8000/api/fournisseurs/suppliers/";

  const mapFromApi = (item) => ({
    id: item.id,
    name: item.name || "",
    contact_name: item.contact_name || "",
    email: item.email || "",
    phone: item.phone || "",
    address: item.address || "",
    city: item.city || "",
    country: item.country || "",
    is_active: Boolean(item.is_active),
    created_at: item.created_at || null,
    updated_at: item.updated_at || null,
  });

  const mapToApi = (item) => ({
    name: item.name,
    contact_name: item.contact_name,
    email: item.email,
    phone: item.phone,
    address: item.address,
    city: item.city,
    country: item.country,
    is_active: item.is_active,
  });

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const response = await fetch(API_BASE, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        setErrorMessage(errorText || "Erreur lors du chargement des fournisseurs");
        return;
      }

      const data = await response.json();
      const items = Array.isArray(data) ? data : (data.results || []);
      setSuppliers(items.map(mapFromApi));
    } catch (error) {
      setErrorMessage("Erreur reseau lors du chargement des fournisseurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (location.pathname === "/fournisseur/new") {
      handleOpenAddDialog();
    }
  }, [location.pathname]);

  const emptyForm = {
    id: null,
    name: "",
    contact_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    is_active: true,
  };

  const handleOpenAddDialog = (supplier = null) => {
    setFormData(supplier ? { ...supplier } : emptyForm);
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setFormData(emptyForm);
    if (location.pathname === "/fournisseur/new") {
      navigate("/fournisseur");
    }
  };

  const handleSaveSupplier = async () => {
    if (!formData.name) {
      setErrorMessage("Le nom du fournisseur est requis");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const isUpdate = Boolean(formData.id);
      const response = await fetch(isUpdate ? `${API_BASE}${formData.id}/` : API_BASE, {
        method: isUpdate ? "PUT" : "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mapToApi(formData)),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setErrorMessage(errorText || "Erreur lors de l'enregistrement du fournisseur");
        return;
      }

      const saved = mapFromApi(await response.json());
      if (isUpdate) {
        setSuppliers(suppliers.map((s) => (s.id === saved.id ? saved : s)));
        setSuccessMessage("Fournisseur mis a jour avec succes");
      } else {
        setSuppliers([saved, ...suppliers]);
        setSuccessMessage("Fournisseur ajoute avec succes");
      }
      handleCloseAddDialog();
    } catch (error) {
      setErrorMessage("Erreur reseau lors de l'enregistrement du fournisseur");
    }
  };

  const handleDeleteSupplier = async (id) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE}${id}/`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });

      if (!response.ok) {
        const errorText = await response.text();
        setErrorMessage(errorText || "Erreur lors de la suppression du fournisseur");
        return;
      }

      setSuppliers(suppliers.filter((s) => s.id !== id));
      setSuccessMessage("Fournisseur supprime avec succes");
    } catch (error) {
      setErrorMessage("Erreur reseau lors de la suppression du fournisseur");
    } finally {
      handleMenuClose();
    }
  };

  const handleToggleStatus = async (supplier) => {
    console.log("Toggle status appelé pour:", supplier);
    console.log("Valeur actuelle de is_active:", supplier.is_active);
    
    const newStatus = !Boolean(supplier.is_active);
    console.log("Nouveau statut:", newStatus);
    
    try {
      // Mise à jour optimiste de l'interface
      setSuppliers(prev => prev.map(s => 
        s.id === supplier.id ? { ...s, is_active: newStatus } : s
      ));

      const token = localStorage.getItem('access_token');
      const payload = mapToApi({ ...supplier, is_active: newStatus });
      console.log("Envoi du payload:", payload);
      
      const res = await fetch(`${API_BASE}${supplier.id}/`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      console.log("Réponse du serveur:", res.status);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Erreur API:", errorData);
        // Annuler la mise à jour optimiste en cas d'erreur
        setSuppliers(prev => prev.map(s => 
          s.id === supplier.id ? { ...s, is_active: Boolean(supplier.is_active) } : s
        ));
        throw new Error(errorData.message || 'Erreur lors de la modification du statut');
      }

      const responseData = await res.json();
      console.log("Réponse complète:", responseData);
      setSuccessMessage(`Fournisseur ${newStatus ? 'activé' : 'désactivé'} avec succès`);
    } catch (err) {
      console.error("Erreur complète:", err);
      setErrorMessage(`Erreur: ${err.message}`);
    }
  };

  const handleMenuOpen = (event, supplier) => {
    setAnchorEl(event.currentTarget);
    setSelectedSupplier(supplier);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSupplier(null);
  };

  const filteredSuppliers = suppliers.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || (
      s.name.toLowerCase().includes(q) ||
      s.contact_name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      s.country.toLowerCase().includes(q)
    );
    
    const matchesStatus = 
      filterStatus === "all" ||
      (filterStatus === "active" && s.is_active) ||
      (filterStatus === "inactive" && !s.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalSuppliers: suppliers.length,
    activeSuppliers: suppliers.filter((s) => s.is_active).length,
    inactiveSuppliers: suppliers.filter((s) => !s.is_active).length,
  };

  const statCards = [
    { label: "Total fournisseurs", value: stats.totalSuppliers, accent: "#3b82f6", onClick: () => setFilterStatus("all") },
    { label: "Actifs", value: stats.activeSuppliers, accent: "#10b981", onClick: () => setFilterStatus("active") },
    { label: "Inactifs", value: stats.inactiveSuppliers, accent: "#ef4444", onClick: () => setFilterStatus("inactive") },
  ];

  const statusOptions = [
    { value: "all", label: "Tous les statuts" },
    { value: "active", label: "Actifs" },
    { value: "inactive", label: "Inactifs" },
  ];

  const activeFiltersCount = filterStatus !== "all" ? 1 : 0;

  const menuItemSx = (active) => ({
    px: 2, py: 0.8,
    color: active ? "#3b82f6" : "#94a3b8",
    bgcolor: active ? "rgba(59,130,246,0.1)" : "transparent",
    fontSize: "0.875rem", display: "flex", justifyContent: "space-between", alignItems: "center",
    "&:hover": { bgcolor: "rgba(59,130,246,0.08)", color: "white" },
  });

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      color: "#94a3b8",
      "& fieldset": { borderColor: "rgba(59,130,246,0.2)" },
      "&:hover fieldset": { borderColor: "rgba(59,130,246,0.4)" },
      "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
      bgcolor: "rgba(59,130,246,0.05)",
      borderRadius: "10px",
    },
    "& .MuiInputLabel-root": { color: "#64748b" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#3b82f6" },
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100vw",
        bgcolor: "black",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
      }}
    >
      <SharedSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(!mobileOpen)}
        selectedMenu="fournisseurs"
      />

      <Box
        component="main"
        sx={{ flexGrow: 1, minWidth: 0, height: "100vh", bgcolor: "black", overflowY: "auto", overflowX: "hidden" }}
      >
        <Box
          sx={{
            p: 1.2,
            borderBottom: "1px solid rgba(59,130,246,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          {isMobile && (
            <IconButton onClick={() => setMobileOpen(!mobileOpen)} sx={{ color: "white" }}>
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: "auto" }}>
            <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" sx={{ color: "white", fontWeight: 600 }}>
                {user?.first_name || user?.username}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                {user?.is_superuser ? "Administrateur" : "Utilisateur"}
              </Typography>
            </Box>
            <Avatar sx={{ width: 40, height: 40, bgcolor: user?.is_superuser ? "#ef4444" : "#3b82f6" }}>
              {user?.first_name?.charAt(0) || user?.username?.charAt(0) || "U"}
            </Avatar>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ color: "white", fontWeight: 700, mb: 0.5 }}>
                Gestion des fournisseurs
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Gelez et suivez vos fournisseurs
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <IconButton
                onClick={fetchSuppliers}
                disabled={loading}
                sx={{ color: "#64748b", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "10px", width: 44, height: 44, "&:hover": { color: "#3b82f6", borderColor: "rgba(59,130,246,0.4)" } }}
              >
                <RefreshIcon />
              </IconButton>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenAddDialog()}
                sx={{ bgcolor: "#3b82f6", color: "white", fontWeight: 600, py: 1.2, px: 3, borderRadius: 2, textTransform: "none", fontSize: "0.95rem", boxShadow: "0 4px 12px rgba(59,130,246,0.3)", "&:hover": { bgcolor: "#2563eb" } }}
              >
                Ajouter un fournisseur
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            {statCards.map((s) => (
              <Box key={s.label} sx={{ flex: "1 1 0", minWidth: 250 }}>
                <StatCard
                  label={s.label}
                  value={s.value}
                  color={s.accent}
                  onClick={s.onClick}
                />
              </Box>
            ))}
          </Box>

          {/* Filter + Search */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: activeFiltersCount > 0 ? 1.5 : 3 }}>
            <Tooltip title="Filtres">
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

            <TextField
              placeholder="Rechercher par nom, contact, email, ville..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#64748b" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  color: "#94a3b8",
                  bgcolor: "rgba(59,130,246,0.08)",
                  borderRadius: "10px",
                  "& fieldset": { borderColor: "rgba(59,130,246,0.2)" },
                  "&:hover fieldset": { borderColor: "rgba(59,130,246,0.4)" },
                  "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
                },
              }}
            />
          </Box>

          {/* Active filter chips */}
          {activeFiltersCount > 0 && (
            <Box sx={{ display: "flex", gap: 1, mb: 2.5, flexWrap: "wrap", alignItems: "center" }}>
              {filterStatus !== "all" && (
                <Chip label={statusOptions.find((s) => s.value === filterStatus)?.label}
                  onDelete={() => setFilterStatus("all")} size="small"
                  sx={{ bgcolor: "rgba(59,130,246,0.15)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.3)", fontWeight: 500 }}
                />
              )}
              <Button size="small" onClick={() => setFilterStatus("all")}
                sx={{ color: "#94a3b8", fontSize: "0.75rem", textTransform: "none", py: 0, minHeight: 0, "&:hover": { color: "#ef4444" } }}
              >
                Tout effacer
              </Button>
            </Box>
          )}

          <Card sx={{ bgcolor: "rgba(30,41,59,0.5)", border: "1px solid rgba(59,130,246,0.1)", borderRadius: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "rgba(59,130,246,0.05)", borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
                    {["Fournisseur", "Contact", "Email", "Telephone", "Ville", "Pays", "Statut", "Actions"].map((h, i) => (
                      <TableCell key={h} align={i >= 6 ? "center" : "left"} sx={{ color: "#94a3b8", fontWeight: 600, borderBottom: "none" }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSuppliers.length > 0 ? (
                    filteredSuppliers.map((supplier) => (
                      <TableRow key={supplier.id} sx={{ borderBottom: "1px solid rgba(59,130,246,0.1)", "&:hover": { bgcolor: "rgba(59,130,246,0.05)" } }}>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Avatar sx={{ bgcolor: "rgba(59,130,246,0.15)", width: 36, height: 36 }}>
                              <BusinessIcon sx={{ fontSize: 18, color: "#3b82f6" }} />
                            </Avatar>
                            <Typography variant="body2" sx={{ color: "white", fontWeight: 600 }}>{supplier.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: "#94a3b8", fontSize: "0.875rem" }}>{supplier.contact_name || "-"}</TableCell>
                        <TableCell sx={{ color: "#94a3b8", fontSize: "0.875rem" }}>{supplier.email || "-"}</TableCell>
                        <TableCell sx={{ color: "#94a3b8", fontSize: "0.875rem" }}>{supplier.phone || "-"}</TableCell>
                        <TableCell sx={{ color: "#94a3b8", fontSize: "0.875rem" }}>{supplier.city || "-"}</TableCell>
                        <TableCell sx={{ color: "#94a3b8", fontSize: "0.875rem" }}>{supplier.country || "-"}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                            <Switch 
                              checked={supplier.is_active} 
                              onChange={() => handleToggleStatus(supplier)}
                              size="small"
                              sx={{ 
                                "& .MuiSwitch-switchBase.Mui-checked": { color: "#10b981" }, 
                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#10b981" } 
                              }}
                            />
                            <Typography variant="caption" sx={{ color: supplier.is_active ? "#10b981" : "#ef4444", fontWeight: 600, fontSize: "0.75rem", minWidth: 55 }}>
                              {supplier.is_active ? "Actif" : "Inactif"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" onClick={(e) => handleMenuOpen(e, supplier)} sx={{ color: "#64748b", "&:hover": { color: "#3b82f6" } }}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ border: "none" }}>
                        <Box sx={{ textAlign: "center", py: 6 }}>
                          <BusinessIcon sx={{ fontSize: 64, color: "rgba(255,255,255,0.1)", mb: 2 }} />
                          <Typography variant="h6" sx={{ color: "white", mb: 1 }}>Aucun fournisseur trouve</Typography>
                          <Typography sx={{ color: "#64748b" }}>
                            {searchQuery ? "Aucun fournisseur ne correspond a votre recherche." : "Commencez par ajouter un fournisseur."}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      </Box>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
        PaperProps={{
          sx: {
            bgcolor: "rgba(13,19,33,0.98)", border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: "12px", backdropFilter: "blur(12px)",
            minWidth: 240, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", mt: 0.5,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.2, borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
          <Typography sx={{ color: "#94a3b8", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 0.75 }}>
            <FilterListIcon sx={{ fontSize: 14 }} />
            Statut
          </Typography>
        </Box>
        {statusOptions.map((opt) => (
          <MenuItem key={opt.value} onClick={() => setFilterStatus(opt.value)} sx={menuItemSx(filterStatus === opt.value)}>
            <span>{opt.label}</span>
            {filterStatus === opt.value && <CheckIcon sx={{ fontSize: 16, ml: "auto" }} />}
          </MenuItem>
        ))}

        {activeFiltersCount > 0 && (
          <>
            <Divider sx={{ borderColor: "rgba(59,130,246,0.1)", mt: 1 }} />
            <Box sx={{ p: 1.5 }}>
              <Button fullWidth size="small"
                onClick={() => { setFilterStatus("all"); setFilterAnchorEl(null); }}
                sx={{ color: "#ef4444", fontSize: "0.8rem", textTransform: "none", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", "&:hover": { bgcolor: "rgba(239,68,68,0.08)" } }}
              >
                Réinitialiser les filtres
              </Button>
            </Box>
          </>
        )}
      </Menu>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            bgcolor: "rgba(15,23,42,0.97)",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: "12px",
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handleOpenAddDialog(selectedSupplier);
            handleMenuClose();
          }}
          sx={{ color: "#3b82f6", fontSize: "0.875rem", gap: 1, "&:hover": { bgcolor: "rgba(59,130,246,0.08)" } }}
        >
          <EditIcon fontSize="small" /> Modifier
        </MenuItem>
        <MenuItem
          onClick={() => handleDeleteSupplier(selectedSupplier?.id)}
          sx={{ color: "#ef4444", fontSize: "0.875rem", gap: 1, "&:hover": { bgcolor: "rgba(239,68,68,0.08)" } }}
        >
          <DeleteIcon fontSize="small" /> Supprimer
        </MenuItem>
      </Menu>

      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: "#1e293b", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: "white", fontWeight: 700, borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
          {formData.id ? "Modifier le fournisseur" : "Ajouter un fournisseur"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Nom" value={formData.name} fullWidth size="small" sx={inputSx}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField label="Contact" value={formData.contact_name} fullWidth size="small" sx={inputSx}
            onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
          />
          <TextField label="Email" value={formData.email} fullWidth size="small" sx={inputSx}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <TextField label="Telephone" value={formData.phone} fullWidth size="small" sx={inputSx}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <TextField label="Adresse" value={formData.address} fullWidth size="small" sx={inputSx}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <TextField label="Ville" value={formData.city} fullWidth size="small" sx={inputSx}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
          <TextField label="Pays" value={formData.country} fullWidth size="small" sx={inputSx}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          />
          <TextField
            select
            label="Statut"
            value={formData.is_active ? "active" : "inactive"}
            fullWidth
            size="small"
            sx={inputSx}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "active" })}
          >
            <MenuItem value="active">Actif</MenuItem>
            <MenuItem value="inactive">Inactif</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid rgba(59,130,246,0.1)" }}>
          <Button onClick={handleCloseAddDialog} sx={{ color: "#94a3b8" }}>Annuler</Button>
          <Button onClick={handleSaveSupplier} variant="contained"
            sx={{ bgcolor: "#3b82f6", fontWeight: 600, textTransform: "none", borderRadius: 2, "&:hover": { bgcolor: "#2563eb" } }}
          >
            Enregistrer
          </Button>
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

export default Fournisseur;
