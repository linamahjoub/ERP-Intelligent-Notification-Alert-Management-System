import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Badge,
  Divider,
  Menu,
  Tooltip,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Menu as MenuIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  SwapHoriz as SwapHorizIcon,
  FileDownload as FileDownloadIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { CiFilter } from "react-icons/ci";
import SharedSidebar from "../../components/SharedSidebar";

/* ─── StatCard ───────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, color, icon: Icon, onClick }) => {
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
        {Icon && <Icon sx={{ fontSize: 28, color: color, mb: 1 }} />}
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

const StockMovements = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [availableProducts, setAvailableProducts] = useState([]);

  const [formData, setFormData] = useState({
    movement_type: "entry",
    product_id: "",
    quantity: 0,
    entry_reason: "purchase",
    exit_reason: "sale",
    warehouse_from: "",
    warehouse_to: "",
    reference: "",
    notes: "",
  });

  const API_BASE = "http://localhost:8000/api/stock/movements/";
  const PRODUCTS_API = "http://localhost:8000/api/stock/products/";

  // ── Filter options ──────────────────────────────────────────────────
  const typeOptions = [
    { value: "all", label: "Tous les types" },
    { value: "entry", label: "Entrée" },
    { value: "exit", label: "Sortie" },
    { value: "transfer", label: "Transfert" },
  ];

  const activeFiltersCount = filterType !== "all" ? 1 : 0;

  const menuItemSx = (active) => ({
    px: 2,
    py: 0.8,
    color: active ? "#3b82f6" : "#94a3b8",
    bgcolor: active ? "rgba(59,130,246,0.1)" : "transparent",
    fontSize: "0.875rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    "&:hover": { bgcolor: "rgba(59,130,246,0.08)", color: "white" },
  });

  // ── Helpers ─────────────────────────────────────────────────────────────
  const movementTypeConfig = {
    entry: { label: "Entrée", icon: ArrowUpwardIcon, color: "#10b981" },
    exit: { label: "Sortie", icon: ArrowDownwardIcon, color: "#ef4444" },
    transfer: { label: "Transfert", icon: SwapHorizIcon, color: "#3b82f6" },
  };

  const reasonLabels = {
    entry: {
      purchase: "Achat",
      return: "Retour",
      adjustment: "Ajustement",
      other: "Autre",
    },
    exit: {
      sale: "Vente",
      loss: "Perte",
      production: "Production",
      damage: "Dommage",
      adjustment: "Ajustement",
      other: "Autre",
    },
  };

  // ── Filtered movements ─────────────────────────────────────────────────
  const filteredMovements = movements.filter((m) => {
    const matchesType = filterType === "all" || m.movement_type === filterType;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      m.product_name.toLowerCase().includes(q) ||
      m.product_sku.toLowerCase().includes(q) ||
      m.reference.toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  // ── Fetch data ───────────────────────────────────────────────────────
  const fetchMovements = async () => {
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
        setErrorMessage(
          errorText || "Erreur lors du chargement des mouvements"
        );
        return;
      }

      const data = await response.json();
      const items = Array.isArray(data) ? data : data.results || [];
      setMovements(items);
    } catch (error) {
      setErrorMessage("Erreur réseau lors du chargement des mouvements");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE}statistics/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(PRODUCTS_API, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const items = Array.isArray(data) ? data : data.results || [];
        setAvailableProducts(items);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error);
    }
  };

  useEffect(() => {
    fetchMovements();
    fetchStatistics();
    fetchProducts();
  }, []);

  // ── Form handlers ────────────────────────────────────────────────────
  const handleOpenAddDialog = () => {
    setFormData({
      movement_type: "entry",
      product_id: "",
      quantity: 0,
      entry_reason: "purchase",
      exit_reason: "sale",
      warehouse_from: "",
      warehouse_to: "",
      reference: "",
      notes: "",
    });
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleSaveMovement = async () => {
    if (!formData.product_id || !formData.quantity) {
      setErrorMessage("Le produit et la quantité sont requis");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      const payload = {
        movement_type: formData.movement_type,
        product_id: formData.product_id,
        quantity: parseInt(formData.quantity),
        reference: formData.reference,
        notes: formData.notes,
      };

      if (
        formData.movement_type === "entry" &&
        formData.entry_reason
      ) {
        payload.entry_reason = formData.entry_reason;
      }

      if (formData.movement_type === "exit" && formData.exit_reason) {
        payload.exit_reason = formData.exit_reason;
      }

      if (formData.movement_type === "transfer") {
        payload.warehouse_from = formData.warehouse_from;
        payload.warehouse_to = formData.warehouse_to;
      }

      const response = await fetch(API_BASE, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setErrorMessage(
          errorText || "Erreur lors de l'enregistrement du mouvement"
        );
        return;
      }

      const saved = await response.json();
      setMovements([saved, ...movements]);
      setSuccessMessage("Mouvement enregistré avec succès");
      fetchStatistics();
      handleCloseAddDialog();
    } catch (error) {
      setErrorMessage("Erreur réseau lors de l'enregistrement");
    }
  };

  const handleDeleteMovement = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce mouvement ?"))
      return;

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE}${id}/`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });

      if (!response.ok) {
        setErrorMessage("Erreur lors de la suppression du mouvement");
        return;
      }

      setMovements(movements.filter((m) => m.id !== id));
      setSuccessMessage("Mouvement supprimé avec succès");
      fetchStatistics();
    } catch (error) {
      setErrorMessage("Erreur réseau lors de la suppression");
    }
  };

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

  const statCards = statistics
    ? [
        {
          type: "all",
          label: "Total Mouvements",
          value: statistics.total_movements,
          color: "#3b82f6",
        },
        { 
          type: "entry",
          label: "Entrées", 
          value: statistics.total_entries, 
          color: "#10b981" 
        },
        { 
          type: "exit",
          label: "Sorties", 
          value: statistics.total_exits, 
          color: "#ef4444" 
        },
        {
          type: "transfer",
          label: "Transferts",
          value: statistics.total_transfers,
          color: "#3b82f6",
        },
        {
          type: "quantity_in",
          label: "Quantité Entrée",
          value: statistics.total_quantity_entered,
          color: "#10b981",
        },
        {
          type: "quantity_out",
          label: "Quantité Sortie",
          value: statistics.total_quantity_exited,
          color: "#ef4444",
        },
      ]
    : [];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "black",
        overflow: "hidden",
      }}
    >
      <SharedSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(!mobileOpen)}
        selectedMenu="stock"
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          height: "100vh",
          bgcolor: "black",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {/* Header bar */}
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
            <IconButton
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ color: "white" }}
            >
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
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: user?.is_superuser ? "#ef4444" : "#3b82f6",
              }}
            >
              {user?.first_name?.charAt(0) || user?.username?.charAt(0) || "U"}
            </Avatar>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Title + Actions */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{ color: "white", fontWeight: 700, mb: 0.5 }}
              >
                Mouvements de Stock
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Historique et traçabilité des mouvements
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <IconButton
                onClick={fetchMovements}
                disabled={loading}
                sx={{
                  color: "#64748b",
                  border: "1px solid rgba(59,130,246,0.15)",
                  borderRadius: "10px",
                  width: 44,
                  height: 44,
                  "&:hover": {
                    color: "#3b82f6",
                    borderColor: "rgba(59,130,246,0.4)",
                  },
                }}
              >
                <RefreshIcon />
              </IconButton>
              {(user?.is_staff || user?.is_superuser) && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddDialog}
                  sx={{
                    bgcolor: "#3b82f6",
                    color: "white",
                    fontWeight: 600,
                    py: 1.2,
                    px: 3,
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: "0.95rem",
                    boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
                    "&:hover": { bgcolor: "#2563eb" },
                  }}
                >
                  Nouveau mouvement
                </Button>
              )}
            </Box>
          </Box>

          {/* Stat Cards - Clickable for filtering */}
          {statCards.length > 0 && (
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
              {statCards.map((s) => (
                <Box 
                  key={s.label} 
                  onClick={() => s.type !== "quantity_in" && s.type !== "quantity_out" && setFilterType(s.type)}
                  sx={{ 
                    flex: "1 1 0", 
                    minWidth: 150,
                    cursor: s.type !== "quantity_in" && s.type !== "quantity_out" ? "pointer" : "default",
                    opacity: s.type !== "quantity_in" && s.type !== "quantity_out" ? 1 : 0.7,
                    transition: "transform 0.2s, opacity 0.2s",
                    "&:hover": s.type !== "quantity_in" && s.type !== "quantity_out" ? {
                      transform: "translateY(-4px)",
                    } : {}
                  }}
                >
                  <StatCard
                    label={s.label}
                    value={s.value}
                    color={s.color}
                  />
                </Box>
              ))}
            </Box>
          )}

          {/* Filter icon + Search bar */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: activeFiltersCount > 0 ? 1.5 : 3 }}>
            <Tooltip title="Filtres avancés">
              <Badge
                badgeContent={activeFiltersCount}
                sx={{
                  "& .MuiBadge-badge": {
                    bgcolor: "#3b82f6",
                    color: "white",
                    fontSize: "0.65rem",
                    minWidth: 16,
                    height: 16,
                  },
                }}
              >
                <IconButton
                  onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                  sx={{
                    color: activeFiltersCount > 0 ? "#3b82f6" : "#64748b",
                    bgcolor: activeFiltersCount > 0 ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.05)",
                    border: activeFiltersCount > 0 ? "1px solid rgba(59,130,246,0.4)" : "1px solid rgba(59,130,246,0.15)",
                    borderRadius: "10px",
                    width: 44,
                    height: 44,
                    flexShrink: 0,
                    "&:hover": { bgcolor: "rgba(59,130,246,0.15)" },
                  }}
                >
                  <CiFilter size={22} />
                </IconButton>
              </Badge>
            </Tooltip>

            <Box sx={{ flex: 1, position: "relative" }}>
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
                placeholder="Rechercher par produit, SKU ou référence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 48px",
                  backgroundColor: "rgba(59,130,246,0.08)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  borderRadius: "10px",
                  color: "#94a3b8",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </Box>
          </Box>

          {/* Active filter chips */}
          {activeFiltersCount > 0 && (
            <Box sx={{ display: "flex", gap: 1, mb: 2.5, flexWrap: "wrap", alignItems: "center" }}>
              {filterType !== "all" && (
                <Chip
                  label={typeOptions.find((t) => t.value === filterType)?.label}
                  onDelete={() => setFilterType("all")}
                  size="small"
                  sx={{
                    bgcolor: "rgba(59,130,246,0.15)",
                    color: "#3b82f6",
                    border: "1px solid rgba(59,130,246,0.3)",
                    fontWeight: 500,
                  }}
                />
              )}
              <Button
                size="small"
                onClick={() => setFilterType("all")}
                sx={{
                  color: "#64748b",
                  fontSize: "0.75rem",
                  textTransform: "none",
                  py: 0,
                  minHeight: 0,
                  "&:hover": { color: "#ef4444" },
                }}
              >
                Tout effacer
              </Button>
            </Box>
          )}

          {/* Table */}
          <Card
            sx={{
              bgcolor: "rgba(30,41,59,0.5)",
              border: "1px solid rgba(59,130,246,0.1)",
              borderRadius: 3,
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: "rgba(59,130,246,0.05)",
                      borderBottom: "1px solid rgba(59,130,246,0.1)",
                    }}
                  >
                    {[
                      "Type",
                      "Produit",
                      "SKU",
                      "Quantité",
                      "Raison",
                      "Responsable",
                      "Référence",
                      "Date",
                      "Actions",
                    ].map((h, i) => (
                      <TableCell
                        key={h}
                        align={i >= 3 && i <= 7 ? "center" : "left"}
                        sx={{
                          color: "#94a3b8",
                          fontWeight: 600,
                          borderBottom: "none",
                          fontSize: "0.85rem",
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMovements.length > 0 ? (
                    filteredMovements.map((movement) => {
                      const config =
                        movementTypeConfig[movement.movement_type];
                      const Icon = config.icon;
                      return (
                        <TableRow
                          key={movement.id}
                          sx={{
                            borderBottom:
                              "1px solid rgba(59,130,246,0.1)",
                            "&:hover": { bgcolor: "rgba(59,130,246,0.05)" },
                          }}
                        >
                          <TableCell>
                            <Chip
                              label={config.label}
                              size="small"
                              sx={{
                                bgcolor: `${config.color}20`,
                                color: config.color,
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                border: `1px solid ${config.color}40`,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: "white", fontWeight: 600 }}>
                            {movement.product_name}
                          </TableCell>
                          <TableCell sx={{ color: "#64748b", fontSize: "0.875rem" }}>
                            {movement.product_sku}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              color: "white",
                              fontWeight: 600,
                            }}
                          >
                            {movement.quantity}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ color: "#94a3b8", fontSize: "0.875rem" }}
                          >
                            {movement.reason}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ color: "#94a3b8", fontSize: "0.875rem" }}
                          >
                            {movement.responsible_name}
                          </TableCell>
                          <TableCell sx={{ color: "#64748b", fontSize: "0.875rem" }}>
                            {movement.reference || "-"}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              color: "#94a3b8",
                              fontSize: "0.875rem",
                            }}
                          >
                            {new Date(movement.created_at).toLocaleDateString(
                              "fr-FR"
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {(user?.is_staff || user?.is_superuser) && (
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleDeleteMovement(movement.id)
                                }
                                sx={{
                                  color: "#ef4444",
                                  "&:hover": { color: "#dc2626" },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} sx={{ border: "none" }}>
                        <Box
                          sx={{
                            textAlign: "center",
                            py: 6,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              color: "white",
                              mb: 1,
                            }}
                          >
                            Aucun mouvement trouvé
                          </Typography>
                          <Typography sx={{ color: "#64748b" }}>
                            {searchQuery || filterType !== "all"
                              ? "Aucun mouvement ne correspond à vos filtres."
                              : "Commencez par ajouter un mouvement."}
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

      {/* Add Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#1e293b",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "white",
            fontWeight: 700,
            borderBottom: "1px solid rgba(59,130,246,0.1)",
          }}
        >
          Enregistrer un mouvement de stock
        </DialogTitle>
        <DialogContent sx={{ pt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Type de mouvement */}
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: "#64748b" }}>
              Type de mouvement
            </InputLabel>
            <Select
              value={formData.movement_type}
              label="Type de mouvement"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  movement_type: e.target.value,
                })
              }
              sx={inputSx}
            >
              <MenuItem value="entry">Entrée</MenuItem>
              <MenuItem value="exit">Sortie</MenuItem>
              <MenuItem value="transfer">Transfert</MenuItem>
            </Select>
          </FormControl>

          {/* Produit */}
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: "#64748b" }}>Produit</InputLabel>
            <Select
              value={formData.product_id}
              label="Produit"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  product_id: e.target.value,
                })
              }
              sx={inputSx}
            >
              <MenuItem value="">Sélectionner un produit</MenuItem>
              {availableProducts.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Quantité */}
          <TextField
            label="Quantité"
            type="number"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({
                ...formData,
                quantity: parseInt(e.target.value) || 0,
              })
            }
            fullWidth
            size="small"
            sx={inputSx}
          />

          {/* Raison si Entrée */}
          {formData.movement_type === "entry" && (
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: "#64748b" }}>
                Raison d'entrée
              </InputLabel>
              <Select
                value={formData.entry_reason}
                label="Raison d'entrée"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    entry_reason: e.target.value,
                  })
                }
                sx={inputSx}
              >
                <MenuItem value="purchase">Achat</MenuItem>
                <MenuItem value="return">Retour</MenuItem>
                <MenuItem value="adjustment">Ajustement</MenuItem>
                <MenuItem value="other">Autre</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Raison si Sortie */}
          {formData.movement_type === "exit" && (
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: "#64748b" }}>
                Raison de sortie
              </InputLabel>
              <Select
                value={formData.exit_reason}
                label="Raison de sortie"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    exit_reason: e.target.value,
                  })
                }
                sx={inputSx}
              >
                <MenuItem value="sale">Vente</MenuItem>
                <MenuItem value="loss">Perte</MenuItem>
                <MenuItem value="production">Production</MenuItem>
                <MenuItem value="damage">Dommage</MenuItem>
                <MenuItem value="adjustment">Ajustement</MenuItem>
                <MenuItem value="other">Autre</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Entrepôts si Transfert */}
          {formData.movement_type === "transfer" && (
            <>
              <TextField
                label="Entrepôt source"
                value={formData.warehouse_from}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    warehouse_from: e.target.value,
                  })
                }
                fullWidth
                size="small"
                sx={inputSx}
              />
              <TextField
                label="Entrepôt destination"
                value={formData.warehouse_to}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    warehouse_to: e.target.value,
                  })
                }
                fullWidth
                size="small"
                sx={inputSx}
              />
            </>
          )}

          {/* Référence */}
          <TextField
            label="Référence (Bon de commande, etc.)"
            value={formData.reference}
            onChange={(e) =>
              setFormData({
                ...formData,
                reference: e.target.value,
              })
            }
            fullWidth
            size="small"
            sx={inputSx}
          />

          {/* Notes */}
          <TextField
            label="Notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData({
                ...formData,
                notes: e.target.value,
              })
            }
            fullWidth
            multiline
            rows={3}
            size="small"
            sx={inputSx}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid rgba(59,130,246,0.1)" }}>
          <Button onClick={handleCloseAddDialog} sx={{ color: "#94a3b8" }}>
            Annuler
          </Button>
          <Button
            onClick={handleSaveMovement}
            variant="contained"
            sx={{
              bgcolor: "#3b82f6",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
              "&:hover": { bgcolor: "#2563eb" },
            }}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
        PaperProps={{
          sx: {
            bgcolor: "rgba(15,23,42,0.97)",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: "12px",
            backdropFilter: "blur(12px)",
            minWidth: 260,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            mt: 0.5,
          },
        }}
      >
        {/* Type section */}
        <Box sx={{ px: 2, pt: 1.5, pb: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="caption"
            sx={{
              color: "#3b82f6",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              fontSize: "0.7rem",
            }}
          >
            Type de mouvement
          </Typography>
        </Box>
        {typeOptions.map((opt) => (
          <MenuItem
            key={opt.value}
            onClick={() => setFilterType(opt.value)}
            sx={menuItemSx(filterType === opt.value)}
          >
            {opt.label}
            {filterType === opt.value && <CheckIcon sx={{ fontSize: 16, color: "#3b82f6" }} />}
          </MenuItem>
        ))}

        {activeFiltersCount > 0 && (
          <>
            <Divider sx={{ borderColor: "rgba(59,130,246,0.15)", mt: 1 }} />
            <Box sx={{ p: 1.5 }}>
              <Button
                fullWidth
                size="small"
                onClick={() => {
                  setFilterType("all");
                  setFilterAnchorEl(null);
                }}
                sx={{
                  color: "#ef4444",
                  fontSize: "0.8rem",
                  textTransform: "none",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "6px",
                  "&:hover": { bgcolor: "rgba(239,68,68,0.08)" },
                }}
              >
                Réinitialiser les filtres
              </Button>
            </Box>
          </>
        )}
      </Menu>

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

export default StockMovements;
