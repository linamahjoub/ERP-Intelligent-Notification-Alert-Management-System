import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box, Typography, Grid, Card, CardContent, Avatar, IconButton, Button,
  useTheme, useMediaQuery, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Menu, MenuItem, TextField, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, Alert, Snackbar, Badge, Divider,
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Menu as MenuIcon,
  Check as CheckIcon,
  CalendarToday as CalendarTodayIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";
import { CiFilter } from "react-icons/ci";
import SharedSidebar from "../../components/SharedSidebar";

const DashboardStock = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: null, name: "", sku: "", category: "", status: "optimal",
    quantity: 0, minQuantity: 0, maxQuantity: 0, price: 0, supplier: "",
  });

  const [products, setProducts] = useState([]);

  // ── Filter config ─────────────────────────────────────────────────────────
  const statusOptions = [
    { value: "all", label: "Tous les statuts" },
    { value: "optimal", label: "Optimal" },
    { value: "low", label: "Stock bas" },
    { value: "out_of_stock", label: "Out of stock" },
    { value: "rupture", label: "Rupture" },
  ];

  const categories = [...new Set(products.map(p => p.category))].map(c => ({ value: c, label: c }));
  const activeFiltersCount = (filterStatus !== "all" ? 1 : 0) + (filterCategory !== "all" ? 1 : 0);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const statusMeta = {
    optimal: { label: "Optimal", color: "#10b981", key: "optimal" },
    low: { label: "Stock bas", color: "#f59e0b", key: "low" },
    out_of_stock: { label: "Out of stock", color: "#ef4444", key: "out_of_stock" },
    rupture: { label: "Rupture", color: "#dc2626", key: "rupture" },
  };

  const getStockStatus = (quantity, minQuantity, maxQuantity, status) => {
    if (status && statusMeta[status]) {
      return statusMeta[status];
    }
    if (quantity === 0) return statusMeta.out_of_stock;
    if (quantity < minQuantity) return statusMeta.low;
    if (quantity > maxQuantity) return statusMeta.optimal;
    return statusMeta.optimal;
  };

  // ── Filtered products ─────────────────────────────────────────────────────
  const filteredProducts = products.filter(p => {
    const status = getStockStatus(p.quantity, p.minQuantity, p.maxQuantity, p.status);
    const matchesStatus = filterStatus === "all" || status.key === filterStatus;
    const matchesCategory = filterCategory === "all" || p.category === filterCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    return matchesStatus && matchesCategory && matchesSearch;
  });

  // ── Stats ─────────────────────────────────────────────────────────────────
  const getStatusKey = (product) => {
    if (product.status && statusMeta[product.status]) {
      return product.status;
    }
    return getStockStatus(product.quantity, product.minQuantity, product.maxQuantity).key;
  };

  const stats = {
    totalProducts: products.length,
    totalValue: products.reduce((sum, p) => sum + p.quantity * p.price, 0),
    lowStockProducts: products.filter(p => getStatusKey(p) === "low").length,
    outOfStockProducts: products.filter(p => {
      const key = getStatusKey(p);
      return key === "out_of_stock" || key === "rupture";
    }).length,
    optimalStock: products.filter(p => getStatusKey(p) === "optimal").length,
  };

  const statCards = [
    { label: "Total Produits", value: stats.totalProducts, accent: "#3b82f6" },
    { label: "Stock Optimal", value: stats.optimalStock, accent: "#10b981" },
    { label: "Stock Bas", value: stats.lowStockProducts, accent: "#f59e0b" },
    { label: "Rupture", value: stats.outOfStockProducts, accent: "#ef4444" },
    { label: "Valeur Totale", value: `$${stats.totalValue.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, accent: "#8b5cf6" },
  ];

  // ── Form / CRUD ───────────────────────────────────────────────────────────
  const emptyForm = { id: null, name: "", sku: "", category: "", status: "optimal", quantity: 0, minQuantity: 0, maxQuantity: 0, price: 0, supplier: "" };
  const handleOpenAddDialog = (product = null) => { setFormData(product ? { ...product } : emptyForm); setOpenAddDialog(true); };
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setFormData(emptyForm);
    if (location.pathname === "/stock/new") {
      navigate("/stock");
    }
  };
  const handleSaveProduct = async () => {
    if (!formData.name || !formData.sku) { setErrorMessage("Nom et SKU sont requis"); return; }
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
        setErrorMessage(errorText || "Erreur lors de l'enregistrement du produit");
        return;
      }

      const saved = mapFromApi(await response.json());
      if (isUpdate) {
        setProducts(products.map(p => p.id === saved.id ? saved : p));
        setSuccessMessage("Produit mis à jour avec succès");
      } else {
        setProducts([saved, ...products]);
        setSuccessMessage("Produit ajouté avec succès");
      }
      handleCloseAddDialog();
    } catch (error) {
      setErrorMessage("Erreur réseau lors de l'enregistrement du produit");
    }
  };
  const handleDeleteProduct = async (id) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE}${id}/`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });

      if (!response.ok) {
        const errorText = await response.text();
        setErrorMessage(errorText || "Erreur lors de la suppression du produit");
        return;
      }

      setProducts(products.filter(p => p.id !== id));
      setSuccessMessage("Produit supprimé avec succès");
    } catch (error) {
      setErrorMessage("Erreur réseau lors de la suppression du produit");
    } finally {
      handleMenuClose();
    }
  };
  const handleMenuOpen = (event, product) => { setAnchorEl(event.currentTarget); setSelectedProduct(product); };
  const handleMenuClose = () => { setAnchorEl(null); setSelectedProduct(null); };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      color: "#94a3b8",
      "& fieldset": { borderColor: "rgba(59,130,246,0.2)" },
      "&:hover fieldset": { borderColor: "rgba(59,130,246,0.4)" },
      "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
      bgcolor: "rgba(59,130,246,0.05)", borderRadius: "10px",
    },
    "& .MuiInputLabel-root": { color: "#64748b" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#3b82f6" },
  };

  const menuItemSx = (active) => ({
    px: 2, py: 0.8,
    color: active ? "#3b82f6" : "#94a3b8",
    bgcolor: active ? "rgba(59,130,246,0.1)" : "transparent",
    fontSize: "0.875rem", display: "flex", justifyContent: "space-between", alignItems: "center",
    "&:hover": { bgcolor: "rgba(59,130,246,0.08)", color: "white" },
  });

  const API_BASE = "http://localhost:8000/api/stock/products/";

  const mapFromApi = (item) => ({
    id: item.id,
    name: item.name || "",
    sku: item.sku || "",
    category: item.category || "",
    status: item.status || "optimal",
    quantity: Number(item.quantity ?? 0),
    minQuantity: Number(item.min_quantity ?? 0),
    maxQuantity: Number(item.max_quantity ?? 0),
    price: Number(item.price ?? 0),
    supplier: item.supplier || "",
    lastRestocked: item.last_restocked || null,
  });

  const mapToApi = (item) => ({
    name: item.name,
    sku: item.sku,
    category: item.category,
    status: item.status,
    quantity: item.quantity,
    min_quantity: item.minQuantity,
    max_quantity: item.maxQuantity,
    price: item.price,
    supplier: item.supplier,
    last_restocked: item.lastRestocked || null,
  });

  const fetchProducts = async () => {
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
        setErrorMessage(errorText || "Erreur lors du chargement du stock");
        return;
      }

      const data = await response.json();
      const items = Array.isArray(data) ? data : (data.results || []);
      setProducts(items.map(mapFromApi));
    } catch (error) {
      setErrorMessage("Erreur réseau lors du chargement du stock");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (location.pathname === "/stock/new") {
      handleOpenAddDialog();
    }
  }, [location.pathname]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", width: "100vw", bgcolor: "black", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
      <SharedSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(!mobileOpen)} selectedMenu="stock" />

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, height: "100vh", bgcolor: "black", overflowY: "auto", overflowX: "hidden" }}>

        {/* Header bar */}
        <Box sx={{ p: 1.2, borderBottom: "1px solid rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          {isMobile && (
            <IconButton onClick={() => setMobileOpen(!mobileOpen)} sx={{ color: "white" }}>
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: "auto" }}>
            <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" sx={{ color: "white", fontWeight: 600 }}>{user?.first_name || user?.username}</Typography>
              <Typography variant="caption" sx={{ color: "#64748b" }}>{user?.is_superuser ? "Administrateur" : "Utilisateur"}</Typography>
            </Box>
            <Avatar sx={{ width: 40, height: 40, bgcolor: user?.is_superuser ? "#ef4444" : "#3b82f6" }}>
              {user?.first_name?.charAt(0) || user?.username?.charAt(0) || "U"}
            </Avatar>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Title + actions */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ color: "white", fontWeight: 700, mb: 0.5 }}>Gestion du Stock</Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>Gérez et surveillez votre inventaire de produits</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <IconButton onClick={fetchProducts} disabled={loading}
                sx={{ color: "#64748b", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "10px", "&:hover": { color: "#3b82f6", borderColor: "rgba(59,130,246,0.4)" } }}
              >
                <RefreshIcon />
              </IconButton>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenAddDialog()}
                sx={{ bgcolor: "#3b82f6", color: "white", fontWeight: 600, py: 1.2, px: 3, borderRadius: 2, textTransform: "none", fontSize: "0.95rem", boxShadow: "0 4px 12px rgba(59,130,246,0.3)", "&:hover": { bgcolor: "#2563eb" } }}
              >
                Ajouter un produit
              </Button>
            </Box>
          </Box>

          {/* Stat Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {statCards.map((s) => (
              <Grid item xs={12} sm={6} md={4} lg key={s.label}>
                <Card sx={{
                  bgcolor: "rgba(30,41,59,0.5)", border: "1px solid rgba(59,130,246,0.1)",
                  borderLeft: `4px solid ${s.accent}`, borderRadius: 3,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: `0 8px 24px ${s.accent}22` },
                }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="body2" sx={{ color: "#64748b", mb: 0.5 }}>{s.label}</Typography>
                    <Typography variant="h5" sx={{ color: "white", fontWeight: 700 }}>{s.value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Filter icon + Search bar */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: activeFiltersCount > 0 ? 1.5 : 3 }}>
            <Tooltip title="Filtres avancés">
              <Badge
                badgeContent={activeFiltersCount}
                sx={{ "& .MuiBadge-badge": { bgcolor: "#3b82f6", color: "white", fontSize: "0.65rem", minWidth: 16, height: 16 } }}
              >
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
                placeholder="Rechercher par nom, SKU ou catégorie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%", padding: "12px 16px 12px 48px",
                  backgroundColor: "rgba(59,130,246,0.08)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  borderRadius: "10px", color: "#94a3b8",
                  fontSize: "0.9rem", outline: "none", boxSizing: "border-box",
                }}
              />
            </Box>
          </Box>

          {/* Active filter chips */}
          {activeFiltersCount > 0 && (
            <Box sx={{ display: "flex", gap: 1, mb: 2.5, flexWrap: "wrap", alignItems: "center" }}>
              {filterStatus !== "all" && (
                <Chip
                  label={statusOptions.find(s => s.value === filterStatus)?.label}
                  onDelete={() => setFilterStatus("all")} size="small"
                  sx={{ bgcolor: "rgba(59,130,246,0.15)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.3)", fontWeight: 500 }}
                />
              )}
              {filterCategory !== "all" && (
                <Chip
                  label={filterCategory}
                  onDelete={() => setFilterCategory("all")} size="small"
                  sx={{ bgcolor: "rgba(59,130,246,0.15)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.3)", fontWeight: 500 }}
                />
              )}
              <Button size="small"
                onClick={() => { setFilterStatus("all"); setFilterCategory("all"); }}
                sx={{ color: "#64748b", fontSize: "0.75rem", textTransform: "none", py: 0, minHeight: 0, "&:hover": { color: "#ef4444" } }}
              >
                Tout effacer
              </Button>
            </Box>
          )}

          {/* Table */}
          <Card sx={{ bgcolor: "rgba(30,41,59,0.5)", border: "1px solid rgba(59,130,246,0.1)", borderRadius: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "rgba(59,130,246,0.05)", borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
                    {["Produit", "SKU", "Catégorie", "Quantité", "Statut", "Prix", "Actions"].map((h, i) => (
                      <TableCell key={h} align={i >= 3 ? "center" : "left"} sx={{ color: "#94a3b8", fontWeight: 600, borderBottom: "none" }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.length > 0 ? filteredProducts.map((product) => {
                    const status = getStockStatus(product.quantity, product.minQuantity, product.maxQuantity, product.status);
                    return (
                      <TableRow key={product.id} sx={{ borderBottom: "1px solid rgba(59,130,246,0.1)", "&:hover": { bgcolor: "rgba(59,130,246,0.05)" } }}>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Avatar sx={{ bgcolor: "rgba(59,130,246,0.15)", width: 36, height: 36 }}>
                              <InventoryIcon sx={{ fontSize: 18, color: "#3b82f6" }} />
                            </Avatar>
                            <Typography variant="body2" sx={{ color: "white", fontWeight: 600 }}>{product.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: "#64748b", fontSize: "0.875rem" }}>{product.sku}</TableCell>
                        <TableCell sx={{ color: "#94a3b8", fontSize: "0.875rem" }}>{product.category}</TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ color: "white", fontWeight: 600 }}>{product.quantity}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={status.label} size="small" sx={{ bgcolor: `${status.color}20`, color: status.color, fontWeight: 600, fontSize: "0.75rem", border: `1px solid ${status.color}40` }} />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ color: "white", fontWeight: 600 }}>${product.price.toFixed(2)}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" onClick={(e) => handleMenuOpen(e, product)} sx={{ color: "#64748b", "&:hover": { color: "#3b82f6" } }}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ border: "none" }}>
                        <Box sx={{ textAlign: "center", py: 6 }}>
                          <InventoryIcon sx={{ fontSize: 64, color: "rgba(255,255,255,0.1)", mb: 2 }} />
                          <Typography variant="h6" sx={{ color: "white", mb: 1 }}>Aucun produit trouvé</Typography>
                          <Typography sx={{ color: "#64748b" }}>
                            {searchQuery || activeFiltersCount > 0 ? "Aucun produit ne correspond à vos filtres." : "Commencez par ajouter un produit."}
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
            bgcolor: "rgba(15,23,42,0.97)", border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: "12px", backdropFilter: "blur(12px)",
            minWidth: 260, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", mt: 0.5,
          },
        }}
      >
        {/* Status section */}
        <Box sx={{ px: 2, pt: 1.5, pb: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
          <CalendarTodayIcon sx={{ fontSize: 14, color: "#3b82f6" }} />
          <Typography variant="caption" sx={{ color: "#3b82f6", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, fontSize: "0.7rem" }}>
            Statut du stock
          </Typography>
        </Box>
        {statusOptions.map((opt) => (
          <MenuItem key={opt.value} onClick={() => setFilterStatus(opt.value)} sx={menuItemSx(filterStatus === opt.value)}>
            {opt.label}
            {filterStatus === opt.value && <CheckIcon sx={{ fontSize: 16, color: "#3b82f6" }} />}
          </MenuItem>
        ))}

        <Divider sx={{ borderColor: "rgba(59,130,246,0.15)", my: 1 }} />

        {/* Category section */}
        <Box sx={{ px: 2, pt: 0.5, pb: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
          <CategoryIcon sx={{ fontSize: 14, color: "#3b82f6" }} />
          <Typography variant="caption" sx={{ color: "#3b82f6", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, fontSize: "0.7rem" }}>
            Catégorie
          </Typography>
        </Box>
        <MenuItem onClick={() => setFilterCategory("all")} sx={menuItemSx(filterCategory === "all")}>
          Toutes les catégories
          {filterCategory === "all" && <CheckIcon sx={{ fontSize: 16, color: "#3b82f6" }} />}
        </MenuItem>
        {categories.map((cat) => (
          <MenuItem key={cat.value} onClick={() => setFilterCategory(cat.value)} sx={menuItemSx(filterCategory === cat.value)}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <InventoryIcon sx={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }} />
              {cat.label}
            </Box>
            {filterCategory === cat.value && <CheckIcon sx={{ fontSize: 16, color: "#3b82f6" }} />}
          </MenuItem>
        ))}

        {activeFiltersCount > 0 && (
          <>
            <Divider sx={{ borderColor: "rgba(59,130,246,0.15)", mt: 1 }} />
            <Box sx={{ p: 1.5 }}>
              <Button fullWidth size="small"
                onClick={() => { setFilterStatus("all"); setFilterCategory("all"); setFilterAnchorEl(null); }}
                sx={{ color: "#ef4444", fontSize: "0.8rem", textTransform: "none", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", "&:hover": { bgcolor: "rgba(239,68,68,0.08)" } }}
              >
                Réinitialiser les filtres
              </Button>
            </Box>
          </>
        )}
      </Menu>

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
        PaperProps={{ sx: { bgcolor: "rgba(15,23,42,0.97)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "12px", backdropFilter: "blur(12px)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" } }}
      >
        <MenuItem onClick={() => { handleOpenAddDialog(selectedProduct); handleMenuClose(); }} sx={{ color: "#3b82f6", fontSize: "0.875rem", gap: 1, "&:hover": { bgcolor: "rgba(59,130,246,0.08)" } }}>
          <EditIcon fontSize="small" /> Modifier
        </MenuItem>
        <MenuItem onClick={() => handleDeleteProduct(selectedProduct?.id)} sx={{ color: "#ef4444", fontSize: "0.875rem", gap: 1, "&:hover": { bgcolor: "rgba(239,68,68,0.08)" } }}>
          <DeleteIcon fontSize="small" /> Supprimer
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: "#1e293b", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: "white", fontWeight: 700, borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
          {formData.id ? "Modifier le produit" : "Ajouter un produit"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            select
            label="Statut"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            fullWidth
            size="small"
            sx={inputSx}
          >
            {statusOptions.filter((opt) => opt.value !== "all").map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          {[
            { label: "Nom du produit", key: "name", type: "text" },
            { label: "SKU", key: "sku", type: "text" },
            { label: "Catégorie", key: "category", type: "text" },
            { label: "Quantité", key: "quantity", type: "number" },
            { label: "Quantité min.", key: "minQuantity", type: "number" },
            { label: "Quantité max.", key: "maxQuantity", type: "number" },
            { label: "Prix", key: "price", type: "number" },
            { label: "Fournisseur", key: "supplier", type: "text" },
          ].map(({ label, key, type }) => (
            <TextField key={key} label={label} type={type} value={formData[key]} fullWidth size="small" sx={inputSx}
              onChange={(e) => setFormData({ ...formData, [key]: type === "number" ? (key === "price" ? parseFloat(e.target.value) || 0 : parseInt(e.target.value) || 0) : e.target.value })}
            />
          ))}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid rgba(59,130,246,0.1)" }}>
          <Button onClick={handleCloseAddDialog} sx={{ color: "#94a3b8" }}>Annuler</Button>
          <Button onClick={handleSaveProduct} variant="contained"
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

export default DashboardStock;
