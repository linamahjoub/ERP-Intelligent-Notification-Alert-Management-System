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
} from "@mui/icons-material";
import SharedSidebar from "../../components/SharedSidebar";

const Fournisseur = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.contact_name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      s.country.toLowerCase().includes(q)
    );
  });

  const stats = {
    totalSuppliers: suppliers.length,
    activeSuppliers: suppliers.filter((s) => s.is_active).length,
    inactiveSuppliers: suppliers.filter((s) => !s.is_active).length,
  };

  const statCards = [
    { label: "Total fournisseurs", value: stats.totalSuppliers, accent: "#3b82f6" },
    { label: "Actifs", value: stats.activeSuppliers, accent: "#10b981" },
    { label: "Inactifs", value: stats.inactiveSuppliers, accent: "#ef4444" },
  ];

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
                sx={{ color: "#64748b", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "10px", "&:hover": { color: "#3b82f6", borderColor: "rgba(59,130,246,0.4)" } }}
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

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {statCards.map((s) => (
              <Grid item xs={12} sm={6} md={4} key={s.label}>
                <Card
                  sx={{
                    bgcolor: "rgba(30,41,59,0.5)",
                    border: "1px solid rgba(59,130,246,0.1)",
                    borderLeft: `4px solid ${s.accent}`,
                    borderRadius: 3,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": { transform: "translateY(-4px)", boxShadow: `0 8px 24px ${s.accent}22` },
                  }}
                >
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="body2" sx={{ color: "#64748b", mb: 0.5 }}>{s.label}</Typography>
                    <Typography variant="h5" sx={{ color: "white", fontWeight: 700 }}>{s.value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: "flex", alignItems: "center", mb: 3, maxWidth: 520 }}>
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

          <Card sx={{ bgcolor: "rgba(30,41,59,0.5)", border: "1px solid rgba(59,130,246,0.1)", borderRadius: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "rgba(59,130,246,0.05)", borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
                    {["Fournisseur", "Contact", "Email", "Telephone", "Ville", "Pays", "Actif", "Actions"].map((h, i) => (
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
                          <Chip
                            label={supplier.is_active ? "Actif" : "Inactif"}
                            size="small"
                            sx={{
                              bgcolor: supplier.is_active ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                              color: supplier.is_active ? "#10b981" : "#ef4444",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              border: `1px solid ${supplier.is_active ? "#10b981" : "#ef4444"}40`,
                            }}
                          />
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
