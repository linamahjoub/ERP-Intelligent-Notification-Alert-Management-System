import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useActivityContext } from "../../context/ActivityContext";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Grid, Card, CardContent, IconButton, Button,
  useTheme, useMediaQuery, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Menu, MenuItem, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, Snackbar, FormControl, InputLabel,
  Select, Divider, Tooltip, Badge, InputAdornment,
} from "@mui/material";
import {
  Receipt as ReceiptIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Payment as PaymentIcon,
  Check as CheckIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import SharedSidebar from "../../components/SharedSidebar";
import { facturationService } from "../../services/facturationService";

/* ─── StatCard Component ─────────────────────────────────────────────────── */
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
        {Icon && <Icon sx={{ color: color, fontSize: 32, mb: 1 }} />}
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

const Facturation = () => {
  const { user } = useAuth();
  const { triggerActivityRefresh } = useActivityContext();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [statistics, setStatistics] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    invoice_number: "",
    invoice_type: "sales",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    customer_address: "",
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: "",
    subtotal: 0,
    tax_rate: 20,
    discount: 0,
    status: "draft",
    notes: "",
    terms: "",
    items: [],
  });

  const [paymentData, setPaymentData] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    amount: 0,
    payment_method: "cash",
    reference: "",
    notes: "",
  });

  const statusOptions = [
    { value: "all", label: "Tous les statuts" },
    { value: "draft", label: "Brouillon" },
    { value: "sent", label: "Envoyée" },
    { value: "paid", label: "Payée" },
    { value: "overdue", label: "En retard" },
    { value: "cancelled", label: "Annulée" },
  ];

  const typeOptions = [
    { value: "all", label: "Tous les types" },
    { value: "sales", label: "Vente" },
    { value: "purchase", label: "Achat" },
  ];

  const paymentMethods = [
    { value: "cash", label: "Espèces" },
    { value: "check", label: "Chèque" },
    { value: "bank_transfer", label: "Virement bancaire" },
    { value: "credit_card", label: "Carte de crédit" },
    { value: "other", label: "Autre" },
  ];

  // Fetch invoices and statistics
  useEffect(() => {
    fetchInvoices();
    fetchStatistics();
  }, [filterStatus, filterType, searchQuery]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus !== "all") params.status = filterStatus;
      if (filterType !== "all") params.type = filterType;
      if (searchQuery) params.search = searchQuery;

      const data = await facturationService.getAllInvoices(params);
      setInvoices(data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setErrorMessage("Erreur lors du chargement des factures");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await facturationService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const handleAddNew = () => {
    setFormData({
      id: null,
      invoice_number: `INV-${Date.now()}`,
      invoice_type: "sales",
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      customer_address: "",
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: "",
      subtotal: 0,
      tax_rate: 20,
      discount: 0,
      status: "draft",
      notes: "",
      terms: "",
      items: [],
    });
    setOpenAddDialog(true);
  };

  const handleEdit = (invoice) => {
    setFormData({
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      invoice_type: invoice.invoice_type,
      customer_name: invoice.customer_name,
      customer_email: invoice.customer_email || "",
      customer_phone: invoice.customer_phone || "",
      customer_address: invoice.customer_address || "",
      invoice_date: invoice.invoice_date,
      due_date: invoice.due_date,
      subtotal: invoice.subtotal,
      tax_rate: invoice.tax_rate,
      discount: invoice.discount,
      status: invoice.status,
      notes: invoice.notes || "",
      terms: invoice.terms || "",
      items: invoice.items || [],
    });
    setOpenAddDialog(true);
    handleCloseMenu();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) {
      try {
        await facturationService.deleteInvoice(id);
        setSuccessMessage("Facture supprimée avec succès");
        fetchInvoices();
        fetchStatistics();
        triggerActivityRefresh();
      } catch (error) {
        setErrorMessage("Erreur lors de la suppression de la facture");
      }
    }
    handleCloseMenu();
  };

  const handleSaveInvoice = async () => {
    try {
      if (formData.id) {
        await facturationService.updateInvoice(formData.id, formData);
        setSuccessMessage("Facture mise à jour avec succès");
      } else {
        await facturationService.createInvoice(formData);
        setSuccessMessage("Facture créée avec succès");
      }
      setOpenAddDialog(false);
      fetchInvoices();
      fetchStatistics();
      triggerActivityRefresh();
    } catch (error) {
      setErrorMessage(error.message || "Erreur lors de la sauvegarde");
    }
  };

  const handleOpenPaymentDialog = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentData({
      payment_date: new Date().toISOString().split('T')[0],
      amount: invoice.balance_due,
      payment_method: "cash",
      reference: "",
      notes: "",
    });
    setOpenPaymentDialog(true);
    handleCloseMenu();
  };

  const handleAddPayment = async () => {
    try {
      await facturationService.addPayment(selectedInvoice.id, paymentData);
      setSuccessMessage("Paiement ajouté avec succès");
      setOpenPaymentDialog(false);
      fetchInvoices();
      fetchStatistics();
      triggerActivityRefresh();
    } catch (error) {
      setErrorMessage("Erreur lors de l'ajout du paiement");
    }
  };

  const handleMenuClick = (event, invoice) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedInvoice(invoice);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid": return "#10b981";
      case "sent": return "#3b82f6";
      case "draft": return "#6b7280";
      case "overdue": return "#ef4444";
      case "cancelled": return "#f97316";
      default: return "#94a3b8";
    }
  };

  const getStatusLabel = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  };

  const getTypeLabel = (type) => {
    return type === "sales" ? "Vente" : "Achat";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <Box sx={{ display: "flex", bgcolor: "#0f172a", minHeight: "100vh", overflow: "hidden" }}>
      <SharedSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: 3, height: "100vh", overflowY: "auto", overflowX: "hidden" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <ReceiptIcon sx={{ fontSize: 40, color: "#3b82f6" }} />
            <Typography variant="h4" sx={{ color: "white", fontWeight: 700 }}>
              Facturation
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Tooltip title="Rafraîchir">
              <IconButton onClick={fetchInvoices} sx={{ color: "white", bgcolor: "#1e293b" }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              sx={{
                bgcolor: "#3b82f6",
                "&:hover": { bgcolor: "#2563eb" },
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Nouvelle Facture
            </Button>
          </Box>
        </Box>

        {/* Statistics Cards */}
        {statistics && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                label="Total Factures"
                value={statistics.total_invoices}
                color="#3b82f6"
                icon={ReceiptIcon}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                label="Chiffre d'affaires"
                value={formatCurrency(statistics.total_revenue)}
                color="#10b981"
                icon={TrendingUpIcon}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                label="En attente"
                value={formatCurrency(statistics.outstanding)}
                color="#f59e0b"
                icon={AttachMoneyIcon}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                label="En retard"
                value={statistics.overdue_count}
                color="#ef4444"
                icon={WarningIcon}
              />
            </Grid>
          </Grid>
        )}

        {/* Filters */}
        <Card sx={{ bgcolor: "#1e293b", mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Rechercher une facture..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: "#94a3b8", mr: 1 }} />,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "white",
                      "& fieldset": { borderColor: "#334155" },
                      "&:hover fieldset": { borderColor: "#475569" },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: "#94a3b8" }}>Statut</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Statut"
                    sx={{
                      color: "white",
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#334155" },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#475569" },
                    }}
                  >
                    {statusOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: "#94a3b8" }}>Type</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="Type"
                    sx={{
                      color: "white",
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#334155" },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#475569" },
                    }}
                  >
                    {typeOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card sx={{ bgcolor: "#1e293b", borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#0f172a" }}>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 600 }}>N° Facture</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 600 }}>Client</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 600 }}>Échéance</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 600 }}>Montant</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 600 }}>Solde dû</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 600 }}>Statut</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    sx={{
                      "&:hover": { bgcolor: "#334155" },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell sx={{ color: "white", fontWeight: 500 }}>
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>{invoice.customer_name}</TableCell>
                    <TableCell sx={{ color: "white" }}>
                      <Chip
                        label={getTypeLabel(invoice.invoice_type)}
                        size="small"
                        sx={{
                          bgcolor: invoice.invoice_type === "sales" ? "#10b98120" : "#f59e0b20",
                          color: invoice.invoice_type === "sales" ? "#10b981" : "#f59e0b",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      {new Date(invoice.invoice_date).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>
                      {formatCurrency(invoice.total_amount)}
                    </TableCell>
                    <TableCell sx={{ color: invoice.balance_due > 0 ? "#f59e0b" : "#10b981", fontWeight: 600 }}>
                      {formatCurrency(invoice.balance_due)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(invoice.status)}
                        size="small"
                        sx={{
                          bgcolor: `${getStatusColor(invoice.status)}20`,
                          color: getStatusColor(invoice.status),
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuClick(e, invoice)}
                        sx={{ color: "#94a3b8" }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {invoices.length === 0 && !loading && (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography sx={{ color: "#94a3b8" }}>
                Aucune facture trouvée
              </Typography>
            </Box>
          )}
        </Card>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          PaperProps={{
            sx: { bgcolor: "#1e293b", color: "white" },
          }}
        >
          <MenuItem onClick={() => handleEdit(selectedInvoice)}>
            <EditIcon sx={{ mr: 1, fontSize: 20 }} /> Modifier
          </MenuItem>
          <MenuItem onClick={() => handleOpenPaymentDialog(selectedInvoice)}>
            <PaymentIcon sx={{ mr: 1, fontSize: 20 }} /> Ajouter un paiement
          </MenuItem>
          <MenuItem onClick={() => handleDelete(selectedInvoice?.id)}>
            <DeleteIcon sx={{ mr: 1, fontSize: 20, color: "#ef4444" }} /> Supprimer
          </MenuItem>
        </Menu>

        {/* Add/Edit Invoice Dialog */}
        <Dialog
          open={openAddDialog}
          onClose={() => setOpenAddDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { bgcolor: "#1e293b", color: "white" } }}
        >
          <DialogTitle sx={{ borderBottom: "1px solid #334155" }}>
            {formData.id ? "Modifier la facture" : "Nouvelle facture"}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="N° de facture"
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                  sx={{ "& .MuiInputLabel-root": { color: "#94a3b8" }, "& .MuiOutlinedInput-root": { color: "white" } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: "#94a3b8" }}>Type</InputLabel>
                  <Select
                    value={formData.invoice_type}
                    onChange={(e) => setFormData({ ...formData, invoice_type: e.target.value })}
                    label="Type"
                    sx={{ color: "white" }}
                  >
                    <MenuItem value="sales">Vente</MenuItem>
                    <MenuItem value="purchase">Achat</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom du client"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  sx={{ "& .MuiInputLabel-root": { color: "#94a3b8" }, "& .MuiOutlinedInput-root": { color: "white" } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  sx={{ "& .MuiInputLabel-root": { color: "#94a3b8" }, "& .MuiOutlinedInput-root": { color: "white" } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  sx={{ "& .MuiInputLabel-root": { color: "#94a3b8" }, "& .MuiOutlinedInput-root": { color: "white" } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Adresse"
                  multiline
                  rows={2}
                  value={formData.customer_address}
                  onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                  sx={{ "& .MuiInputLabel-root": { color: "#94a3b8" }, "& .MuiOutlinedInput-root": { color: "white" } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date de facturation"
                  type="date"
                  value={formData.invoice_date}
                  onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ "& .MuiInputLabel-root": { color: "#94a3b8" }, "& .MuiOutlinedInput-root": { color: "white" } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date d'échéance"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ "& .MuiInputLabel-root": { color: "#94a3b8" }, "& .MuiOutlinedInput-root": { color: "white" } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Sous-total"
                  type="number"
                  value={formData.subtotal}
                  onChange={(e) => setFormData({ ...formData, subtotal: parseFloat(e.target.value) || 0 })}
                  sx={{ "& .MuiInputLabel-root": { color: "#94a3b8" }, "& .MuiOutlinedInput-root": { color: "white" } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="TVA (%)"
                  type="number"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                  sx={{ "& .MuiInputLabel-root": { color: "#94a3b8" }, "& .MuiOutlinedInput-root": { color: "white" } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Remise"
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                  sx={{ "& .MuiInputLabel-root": { color: "#94a3b8" }, "& .MuiOutlinedInput-root": { color: "white" } }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: "#94a3b8" }}>Statut</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    label="Statut"
                    sx={{ color: "white" }}
                  >
                    {statusOptions.filter(opt => opt.value !== "all").map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  sx={{ "& .MuiInputLabel-root": { color: "#94a3b8" }, "& .MuiOutlinedInput-root": { color: "white" } }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: "1px solid #334155" }}>
            <Button onClick={() => setOpenAddDialog(false)} sx={{ color: "#94a3b8" }}>
              Annuler
            </Button>
            <Button
              onClick={handleSaveInvoice}
              variant="contained"
              sx={{ bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" } }}
            >
              {formData.id ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog
          open={openPaymentDialog}
          onClose={() => setOpenPaymentDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { bgcolor: "#1e293b", color: "white" } }}
        >
          <DialogTitle sx={{ borderBottom: "1px solid #334155" }}>
            Ajouter un paiement
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Date de paiement"
                  type="date"
                  value={paymentData.payment_date}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ "& .MuiInputLabel-root": { color: "#94a3b8" }, "& .MuiOutlinedInput-root": { color: "white" } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Montant"
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
                  sx={{ "& .MuiInputLabel-root": { color: "#94a3b8" }, "& .MuiOutlinedInput-root": { color: "white" } }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: "#94a3b8" }}>Méthode de paiement</InputLabel>
                  <Select
                    value={paymentData.payment_method}
                    onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                    label="Méthode de paiement"
                    sx={{ color: "white" }}
                  >
                    {paymentMethods.map(method => (
                      <MenuItem key={method.value} value={method.value}>{method.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Référence"
                  value={paymentData.reference}
                  onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                  sx={{ "& .MuiInputLabel-root": { color: "#94a3b8" }, "& .MuiOutlinedInput-root": { color: "white" } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={2}
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  sx={{ "& .MuiInputLabel-root": { color: "#94a3b8" }, "& .MuiOutlinedInput-root": { color: "white" } }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: "1px solid #334155" }}>
            <Button onClick={() => setOpenPaymentDialog(false)} sx={{ color: "#94a3b8" }}>
              Annuler
            </Button>
            <Button
              onClick={handleAddPayment}
              variant="contained"
              sx={{ bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" } }}
            >
              Ajouter le paiement
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbars */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={5000}
          onClose={() => setSuccessMessage("")}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert onClose={() => setSuccessMessage("")} severity="success" sx={{ width: "100%" }}>
            {successMessage}
          </Alert>
        </Snackbar>
        <Snackbar
          open={!!errorMessage}
          autoHideDuration={5000}
          onClose={() => setErrorMessage("")}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert onClose={() => setErrorMessage("")} severity="error" sx={{ width: "100%" }}>
            {errorMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Facturation;
