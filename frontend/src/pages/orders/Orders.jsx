import React, { useEffect, useState } from "react";
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Badge,
  Menu,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Menu as MenuIcon,
  ShoppingCart as ShoppingCartIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  DescriptionOutlined as DescriptionIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { CiFilter } from "react-icons/ci";
import SharedSidebar from "../../components/SharedSidebar";

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
        minHeight: 100,
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

const Orders = () => {
  const { user } = useAuth();
  const isAdmin = user?.is_staff || user?.is_superuser;
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [statistics, setStatistics] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const API_BASE = "http://localhost:8000/api/orders/orders/";

  const statusConfig = {
    pending: { label: "En attente", color: "#f59e0b" },
    confirmed: { label: "Confirmée", color: "#3b82f6" },
    preparing: { label: "En préparation", color: "#8b5cf6" },
    shipped: { label: "Expédiée", color: "#06b6d4" },
    delivered: { label: "Livrée", color: "#10b981" },
    returned: { label: "Retournée", color: "#6b7280" },
    cancelled: { label: "Annulée", color: "#ef4444" },
  };

  // Status filter options
  const statusOptions = [
    { value: "all", label: "Tous les statuts" },
    { value: "pending", label: "En attente" },
    { value: "confirmed", label: "Confirmée" },
    { value: "preparing", label: "En préparation" },
    { value: "shipped", label: "Expédiée" },
    { value: "delivered", label: "Livrée" },
    { value: "returned", label: "Retournée" },
    { value: "cancelled", label: "Annulée" },
  ];

  const activeFiltersCount = filterStatus !== "all" ? 1 : 0;

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

  // Filtre les commandes
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesSearch =
      !searchQuery ||
      order.id.toString().includes(searchQuery) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.customer_email && order.customer_email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });
  const pendingOrdersCount = orders.filter((order) => order.status === "pending").length;

  // Récupère les commandes
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      // Si c'est un utilisateur normal, récupère ses propres commandes
      const url = isAdmin ? API_BASE : `${API_BASE}my_orders/`;

      const response = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        setErrorMessage(errorText || "Erreur lors du chargement des commandes");
        return;
      }

      const data = await response.json();
      const items = Array.isArray(data) ? data : data.results || [];
      setOrders(items);
    } catch (error) {
      setErrorMessage("Erreur réseau lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  // Récupère les statistiques
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

  useEffect(() => {
    fetchOrders();
    fetchStatistics();
  }, []);

  const handleNewOrder = () => {
    navigate("/orders/new");
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE}${orderId}/confirm/`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        setErrorMessage(errorText || "Erreur lors de la confirmation de la commande");
        return;
      }

      const updatedOrder = await response.json();
      setOrders((prev) => prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)));
      if (selectedOrder?.id === updatedOrder.id) {
        setSelectedOrder(updatedOrder);
      }
      setSuccessMessage(`Commande #${updatedOrder.id} confirmée avec succès`);
      fetchStatistics();
    } catch (error) {
      setErrorMessage("Erreur réseau lors de la confirmation de la commande");
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOpenDetailsDialog(true);
  };

  const handleCloseDetails = () => {
    setOpenDetailsDialog(false);
    setSelectedOrder(null);
  };

  const handleExportPDF = () => {
    if (!selectedOrder) return;

    // Create formatted HTML for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              color: #1976d2;
            }
            .order-id {
              font-size: 14px;
              color: #666;
              margin-top: 5px;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-weight: bold;
              font-size: 14px;
              color: #1976d2;
              margin-bottom: 10px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
            .info-row {
              display: flex;
              margin-bottom: 8px;
            }
            .label {
              font-weight: bold;
              width: 150px;
              color: #555;
            }
            .value {
              flex: 1;
              color: #333;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th {
              background-color: #f5f5f5;
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
              font-weight: bold;
              color: #333;
            }
            td {
              border: 1px solid #ddd;
              padding: 8px;
              color: #333;
            }
            .total-row {
              font-weight: bold;
              background-color: #f9f9f9;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #999;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Commande</h1>
            <div class="order-id">Commande #${selectedOrder.id}</div>
          </div>

          <div class="section">
            <div class="section-title">Informations de la Commande</div>
            <div class="info-row">
              <span class="label">Numéro de commande:</span>
              <span class="value">${selectedOrder.id}</span>
            </div>
            <div class="info-row">
              <span class="label">Client:</span>
              <span class="value">${selectedOrder.customer_name}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value">${selectedOrder.customer_email}</span>
            </div>
            <div class="info-row">
              <span class="label">Status:</span>
              <span class="value">
                <span class="status-badge" style="background-color: ${statusConfig[selectedOrder.status]?.color}20; color: ${statusConfig[selectedOrder.status]?.color};">
                  ${statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                </span>
              </span>
            </div>
            <div class="info-row">
              <span class="label">Date de création:</span>
              <span class="value">${new Date(selectedOrder.created_at).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Adresse de Livraison</div>
            <div class="info-row">
              <span class="value" style="white-space: pre-wrap;">${selectedOrder.shipping_address}</span>
            </div>
            <div class="info-row">
              <span class="label">Méthode de livraison:</span>
              <span class="value">${selectedOrder.shipping_method || "Non spécifiée"}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Détail des Articles</div>
            <table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th style="width: 80px; text-align: center;">Quantité</th>
                  <th style="width: 100px; text-align: right;">Prix unitaire</th>
                  <th style="width: 100px; text-align: right;">Sous-total</th>
                </tr>
              </thead>
              <tbody>
                ${selectedOrder.items?.map((item) => `
                  <tr>
                    <td>${item.product?.name || "Produit supprimé"}</td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">${parseFloat(item.unit_price).toFixed(2)} €</td>
                    <td style="text-align: right;">${(item.quantity * parseFloat(item.unit_price)).toFixed(2)} €</td>
                  </tr>
                `).join("")}
                <tr class="total-row">
                  <td colspan="3" style="text-align: right;">Montant Total:</td>
                  <td style="text-align: right;">${parseFloat(selectedOrder.total_amount).toFixed(2)} €</td>
                </tr>
              </tbody>
            </table>
          </div>

          ${selectedOrder.notes ? `
            <div class="section">
              <div class="section-title">Notes</div>
              <div class="info-row">
                <span class="value" style="white-space: pre-wrap;">${selectedOrder.notes}</span>
              </div>
            </div>
          ` : ""}

          <div class="footer">
            <p>Document généré le ${new Date().toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</p>
          </div>
        </body>
      </html>
    `;

    // Open in new window and print to PDF
    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const statCards = statistics
    ? [
        { label: "Total", value: statistics.total_orders, color: "#3b82f6" },
        { label: "En attente", value: statistics.pending, color: "#f59e0b" },
        { label: "Confirmées", value: statistics.confirmed, color: "#3b82f6" },
        { label: "Livrées", value: statistics.delivered, color: "#10b981" },
        { label: "Annulées", value: statistics.cancelled, color: "#ef4444" },
      ]
    : [];

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
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "black", overflow: "hidden", position: "relative" }}>
      <SharedSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(!mobileOpen)}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          height: "100vh",
          bgcolor: "black",
          position: "relative",
          zIndex: 1,
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
              <Typography variant="h4" sx={{ color: "white", fontWeight: 700, mb: 0.5 }}>
                Commandes
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                {isAdmin
                  ? "Gérez toutes les commandes"
                  : "Consultez vos commandes"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <IconButton
                onClick={fetchOrders}
                disabled={loading}
                sx={{
                  color: "#64748b",
                  border: "1px solid rgba(59,130,246,0.15)",
                  borderRadius: "10px",
                  width: 44,
                  height: 44,
                  "&:hover": { color: "#3b82f6", borderColor: "rgba(59,130,246,0.4)" },
                }}
              >
                <RefreshIcon />
              </IconButton>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleNewOrder}
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
                Nouvelle commande
              </Button>
            </Box>
          </Box>

          {/* Stat Cards */}
          {statCards.length > 0 && (
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
              {statCards.map((s) => (
                <Box key={s.label} sx={{ flex: "1 1 0", minWidth: 150 }}>
                  <StatCard label={s.label} value={s.value} color={s.color} />
                </Box>
              ))}
            </Box>
          )}

          {/* Pending confirmation panel (admin) */}
          {isAdmin && pendingOrdersCount > 0 && (
            <Card
              sx={{
                mb: 3,
                bgcolor: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.25)",
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                <Box>
                  <Typography sx={{ color: "#f59e0b", fontWeight: 700 }}>
                    Commandes en attente de confirmation
                  </Typography>
                  <Typography sx={{ color: "#fcd34d", fontSize: "0.9rem" }}>
                    {pendingOrdersCount} commande(s) nécessitent votre validation.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => setFilterStatus("pending")}
                  sx={{
                    bgcolor: "#f59e0b",
                    color: "#111827",
                    fontWeight: 700,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#d97706" },
                  }}
                >
                  Voir les commandes à confirmer
                </Button>
              </CardContent>
            </Card>
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
                placeholder="Rechercher par ID, client..."
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
              {filterStatus !== "all" && (
                <Chip
                  label={statusOptions.find((s) => s.value === filterStatus)?.label}
                  onDelete={() => setFilterStatus("all")}
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
                onClick={() => setFilterStatus("all")}
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
                    {["ID", "Client", "Email", "Statut", "Montant", "Articles", "Date", "Actions"].map((h, i) => (
                      <TableCell
                        key={h}
                        align={i >= 3 && i <= 5 ? "center" : "left"}
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
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        sx={{
                          borderBottom: "1px solid rgba(59,130,246,0.1)",
                          "&:hover": { bgcolor: "rgba(59,130,246,0.05)" },
                        }}
                      >
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>
                          #{order.id}
                        </TableCell>
                        <TableCell sx={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                          {order.customer_name}
                        </TableCell>
                        <TableCell sx={{ color: "#64748b", fontSize: "0.875rem" }}>
                          {order.customer_email}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={statusConfig[order.status]?.label || order.status}
                            size="small"
                            sx={{
                              bgcolor: `${statusConfig[order.status]?.color || "#94a3b8"}20`,
                              color: statusConfig[order.status]?.color || "#94a3b8",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              border: `1px solid ${statusConfig[order.status]?.color || "#94a3b8"}40`,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ color: "white", fontWeight: 600 }}>
                          {parseFloat(order.total_amount).toFixed(2)} €
                        </TableCell>
                        <TableCell align="center" sx={{ color: "#94a3b8" }}>
                          {order.item_count}
                        </TableCell>
                        <TableCell sx={{ color: "#64748b", fontSize: "0.875rem" }}>
                          {new Date(order.created_at).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell align="center">
                          {isAdmin && order.status === "pending" && (
                            <IconButton
                              size="small"
                              onClick={() => handleConfirmOrder(order.id)}
                              sx={{ color: "#10b981", mr: 0.5, "&:hover": { color: "#059669" } }}
                              title="Confirmer la commande"
                            >
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            onClick={() => handleViewOrder(order)}
                            sx={{ color: "#3b82f6", "&:hover": { color: "#2563eb" } }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ border: "none" }}>
                        <Box sx={{ textAlign: "center", py: 6 }}>
                          <ShoppingCartIcon sx={{ fontSize: 64, color: "rgba(255,255,255,0.1)", mb: 2 }} />
                          <Typography variant="h6" sx={{ color: "white", mb: 1 }}>
                            Aucune commande trouvée
                          </Typography>
                          <Typography sx={{ color: "#64748b" }}>
                            {searchQuery || filterStatus !== "all"
                              ? "Aucune commande ne correspond à vos filtres."
                              : "Commencez par créer une commande."}
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

      {/* Details Dialog */}
      <Dialog
        open={openDetailsDialog}
        onClose={handleCloseDetails}
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
        <DialogTitle sx={{ color: "white", fontWeight: 700, borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
          Détails Commande #{selectedOrder?.id}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          {selectedOrder && (
            <>
              <div>
                <Typography variant="body2" sx={{ color: "#64748b", mb: 1 }}>
                  Client
                </Typography>
                <Typography sx={{ color: "white", fontWeight: 600 }}>
                  {selectedOrder.customer_name}
                </Typography>
              </div>

              <div>
                <Typography variant="body2" sx={{ color: "#64748b", mb: 1 }}>
                  Statut
                </Typography>
                <Chip
                  label={statusConfig[selectedOrder.status]?.label}
                  sx={{
                    bgcolor: `${statusConfig[selectedOrder.status]?.color}20`,
                    color: statusConfig[selectedOrder.status]?.color,
                    fontWeight: 600,
                  }}
                />
              </div>

              <div>
                <Typography variant="body2" sx={{ color: "#64748b", mb: 1 }}>
                  Montant Total
                </Typography>
                <Typography sx={{ color: "white", fontWeight: 600, fontSize: "1.2rem" }}>
                  {parseFloat(selectedOrder.total_amount).toFixed(2)} €
                </Typography>
              </div>

              <div>
                <Typography variant="body2" sx={{ color: "#64748b", mb: 1 }}>
                  Adresse de livraison
                </Typography>
                <Typography sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                  {selectedOrder.shipping_address || "Non spécifiée"}
                </Typography>
              </div>

              <div>
                <Typography variant="body2" sx={{ color: "#64748b", mb: 1 }}>
                  Articles ({selectedOrder.item_count})
                </Typography>
                <Box sx={{ bgcolor: "rgba(59,130,246,0.05)", p: 1.5, borderRadius: 1 }}>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item) => (
                      <Box key={item.id} sx={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: "0.85rem", mb: 1 }}>
                        <span>
                          {item.product.name} x{item.quantity}
                        </span>
                        <span>{(Number(item.subtotal) || 0).toFixed(2)} €</span>
                      </Box>
                    ))
                  ) : (
                    <Typography sx={{ color: "#64748b" }}>Aucun article</Typography>
                  )}
                </Box>
              </div>

              <div>
                <Typography variant="body2" sx={{ color: "#64748b", mb: 1 }}>
                  Date de création
                </Typography>
                <Typography sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                  {new Date(selectedOrder.created_at).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </div>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid rgba(59,130,246,0.1)", display: "flex", gap: 1, justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            {isAdmin && selectedOrder?.status === "pending" && (
              <Button
                onClick={() => handleConfirmOrder(selectedOrder.id)}
                startIcon={<CheckIcon />}
                sx={{
                  color: "white",
                  bgcolor: "#3b82f6",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "#2563eb" },
                }}
              >
                Confirmer la commande
              </Button>
            )}
            <Button
              onClick={handleExportPDF}
              startIcon={<DownloadIcon />}
              sx={{
                color: "white",
                bgcolor: "#10b981",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
                "&:hover": { bgcolor: "#059669" },
              }}
            >
              Exporter en PDF
            </Button>
          </Box>
          <Button onClick={handleCloseDetails} sx={{ color: "#94a3b8" }}>
            Fermer
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
        {/* Status section */}
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
            Statut de la commande
          </Typography>
        </Box>
        {statusOptions.map((opt) => (
          <MenuItem
            key={opt.value}
            onClick={() => setFilterStatus(opt.value)}
            sx={menuItemSx(filterStatus === opt.value)}
          >
            {opt.label}
            {filterStatus === opt.value && <CheckIcon sx={{ fontSize: 16, color: "#3b82f6" }} />}
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
                  setFilterStatus("all");
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

export default Orders;
