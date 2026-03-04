import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useActivityContext } from "../../context/ActivityContext";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Grid, Card, CardContent, IconButton, Button,
  useTheme, useMediaQuery, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Menu, MenuItem, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, Snackbar, FormControl, InputLabel,
  Select, Divider, Tooltip, Badge, InputAdornment, Avatar, Checkbox,
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
  Menu as MenuIcon,
  PictureAsPdf as PdfIcon,
} from "@mui/icons-material";
import SharedSidebar from "../../components/SharedSidebar";
import { facturationService } from "../../services/facturationService";
import { categoryService } from "../../services/categoryService";
import { fournisseurService } from "../../services/fournisseurService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ─── StatCard Component ─────────────────────────────────────────────────── */
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
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [formData, setFormData] = useState({
    id: null,
    invoice_number: "",
    purchase_order_number: "",
    invoice_type: "sales",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    customer_address: "",
    supplier: "",
    category: "",
    currency: "EUR",
    supplier_departure_date: "",
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

  const taxRateOptions = [0, 7, 13, 19, 20];

  // Fetch invoices and statistics
  useEffect(() => {
    fetchInvoices();
    fetchStatistics();
  }, [filterStatus, filterType, searchQuery]);

  useEffect(() => {
    fetchCategories();
    fetchSuppliers();
  }, []);

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

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const data = await fournisseurService.getAllSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const handleAddNew = () => {
    setFormData({
      id: null,
      invoice_number: `INV-${Date.now()}`,
      purchase_order_number: "",
      invoice_type: "sales",
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      customer_address: "",
      supplier: "",
      category: "",
      currency: "EUR",
      supplier_departure_date: "",
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
      purchase_order_number: invoice.purchase_order_number || "",
      invoice_type: invoice.invoice_type,
      customer_name: invoice.customer_name,
      customer_email: invoice.customer_email || "",
      customer_phone: invoice.customer_phone || "",
      customer_address: invoice.customer_address || "",
      supplier: invoice.supplier || "",
      category: invoice.category || "",
      currency: invoice.currency || "EUR",
      supplier_departure_date: invoice.supplier_departure_date || "",
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
    if (!formData.supplier) {
      setErrorMessage("Veuillez sélectionner un fournisseur depuis la base");
      return;
    }

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

  const handleExportPDF = (invoice) => {
    try {
      if (!invoice) {
        setErrorMessage("Aucune facture sélectionnée");
        return;
      }

      const doc = new jsPDF();
      
      // En-tête de la facture
      doc.setFontSize(20);
      doc.setTextColor(59, 130, 246);
      doc.text("FACTURE", 105, 20, { align: "center" });
      
      // Ligne de séparation
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(0.5);
      doc.line(20, 25, 190, 25);
      
      // Informations de la facture
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      let y = 35;
      doc.setFont("helvetica", "bold");
      doc.text(`N° Facture: ${invoice.invoice_number || 'N/A'}`, 20, y);
      doc.text(`Date: ${formatDate(invoice.invoice_date)}`, 140, y);
      
      y += 7;
      if (invoice.purchase_order_number) {
        doc.setFont("helvetica", "normal");
        doc.text(`N° Commande Achat: ${invoice.purchase_order_number}`, 20, y);
        y += 7;
      }
      
      doc.setFont("helvetica", "normal");
      doc.text(`Échéance: ${formatDate(invoice.due_date)}`, 140, y - 7);
      
      y += 3;
      
      // Informations fournisseur
      doc.setFont("helvetica", "bold");
      doc.text("FOURNISSEUR", 20, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      doc.text(invoice.supplier_name || invoice.customer_name || "-", 20, y);
      y += 5;
      if (invoice.customer_email) {
        doc.text(`Email: ${invoice.customer_email}`, 20, y);
        y += 5;
      }
      if (invoice.customer_phone) {
        doc.text(`Tél: ${invoice.customer_phone}`, 20, y);
        y += 5;
      }
      if (invoice.customer_address) {
        const addressLines = doc.splitTextToSize(invoice.customer_address, 80);
        doc.text(addressLines, 20, y);
        y += addressLines.length * 5;
      }
      
      y += 5;
      
      // Détails supplémentaires
      if (invoice.category_name) {
        doc.setFont("helvetica", "bold");
        doc.text("Catégorie: ", 20, y);
        doc.setFont("helvetica", "normal");
        doc.text(invoice.category_name, 45, y);
        y += 7;
      }
      
      if (invoice.supplier_departure_date) {
        doc.setFont("helvetica", "bold");
        doc.text("Départ Fournisseur: ", 20, y);
        doc.setFont("helvetica", "normal");
        doc.text(formatDate(invoice.supplier_departure_date), 60, y);
        y += 7;
      }
      
      doc.setFont("helvetica", "bold");
      doc.text("Statut: ", 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(getStatusLabel(invoice.status), 40, y);
      
      y += 10;
      
      // Tableau des montants
      const tableData = [
        ["Sous-total HT", formatCurrency(invoice.subtotal || 0, invoice.currency)],
        ["TVA", formatCurrency(invoice.tax_amount || 0, invoice.currency)],
        ["Total TTC", formatCurrency(invoice.total_amount || 0, invoice.currency)],
      ];
      
      // Utiliser autoTable (plugin jspdf-autotable)
      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          startY: y,
          head: [["Description", "Montant"]],
          body: tableData,
          theme: "striped",
          headStyles: { fillColor: [59, 130, 246], textColor: 255 },
          styles: { fontSize: 10 },
          columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 70, halign: "right", fontStyle: "bold" },
          },
        });
        y = doc.lastAutoTable.finalY + 10;
      } else {
        // Fallback si autoTable n'est pas disponible
        console.warn("autoTable non disponible, affichage simple");
        tableData.forEach(([label, value]) => {
          doc.text(label, 20, y);
          doc.text(value, 140, y);
          y += 7;
        });
        y += 3;
      }
      
      // Notes
      if (invoice.notes) {
        doc.setFont("helvetica", "bold");
        doc.text("Observations:", 20, y);
        y += 7;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const notesLines = doc.splitTextToSize(invoice.notes, 170);
        doc.text(notesLines, 20, y);
        y += notesLines.length * 5;
      }
      
      // Pied de page
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const footerY = 280;
      doc.text(`Créé par: ${invoice.created_by_name || "-"}`, 20, footerY);
      doc.text(`Date de création: ${formatDateTime(invoice.created_at)}`, 20, footerY + 5);
      if (invoice.updated_by_name) {
        doc.text(`Modifié par: ${invoice.updated_by_name}`, 20, footerY + 10);
        doc.text(`Date de modification: ${formatDateTime(invoice.updated_at)}`, 20, footerY + 15);
      }
      
      // Sauvegarde du PDF
      const filename = `Facture_${invoice.invoice_number || 'sans_numero'}.pdf`;
      doc.save(filename);
      setSuccessMessage("PDF exporté avec succès");
      handleCloseMenu();
    } catch (error) {
      console.error("Erreur détaillée lors de l'export PDF:", error);
      setErrorMessage(`Erreur lors de l'export du PDF: ${error.message || 'Erreur inconnue'}`);
      handleCloseMenu();
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

  const handleToggleRowSelection = (invoiceId) => {
    setSelectedInvoiceIds((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedInvoiceIds.length === invoices.length) {
      setSelectedInvoiceIds([]);
      return;
    }
    setSelectedInvoiceIds(invoices.map((invoice) => invoice.id));
  };

  const allRowsSelected = invoices.length > 0 && selectedInvoiceIds.length === invoices.length;
  const someRowsSelected = selectedInvoiceIds.length > 0 && selectedInvoiceIds.length < invoices.length;

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

  const normalizeCurrencyCode = (currency) => {
    const raw = String(currency || "").trim().toUpperCase();
    const aliases = {
      DT: "TND",
      "D.T": "TND",
      DINAR: "TND",
      DINARS: "TND",
    };
    if (aliases[raw]) return aliases[raw];
    return raw || "EUR";
  };

  const formatCurrency = (amount, currency = "EUR") => {
    const safeAmount = Number(amount) || 0;
    const normalizedCurrency = normalizeCurrencyCode(currency);

    try {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: normalizedCurrency,
      }).format(safeAmount);
    } catch (error) {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }).format(safeAmount);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    const date = new Date(dateValue);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("fr-FR");
  };

  const formatDateTime = (dateValue) => {
    if (!dateValue) return "-";
    const date = new Date(dateValue);
    return Number.isNaN(date.getTime())
      ? "-"
      : date.toLocaleString("fr-FR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "black", overflow: "hidden" }}>
      <SharedSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(!mobileOpen)} selectedMenu="facturation" />

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
              <Typography variant="h4" sx={{ color: "white", fontWeight: 700, mb: 0.5 }}>Facturation</Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>Gérez vos factures et paiements</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <IconButton onClick={fetchInvoices} disabled={loading}
                sx={{ color: "#64748b", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "10px", width: 44, height: 44, "&:hover": { color: "#3b82f6", borderColor: "rgba(59,130,246,0.4)" } }}
              >
                <RefreshIcon />
              </IconButton>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddNew}
                sx={{
                  bgcolor: "#3b82f6",
                  "&:hover": { bgcolor: "#2563eb" },
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "10px",
                  px: 2.5,
                }}
              >
                Nouvelle Facture
              </Button>
            </Box>
          </Box>

     
        {/* Filters */}
        <Card sx={{ bgcolor: "rgba(30,41,59,0.5)", border: "1px solid rgba(59,130,246,0.1)", borderRadius: 3, mb: 3 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Rechercher une facture..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: "#64748b", mr: 1 }} />,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "#94a3b8",
                      "& fieldset": { borderColor: "rgba(59,130,246,0.2)" },
                      "&:hover fieldset": { borderColor: "rgba(59,130,246,0.4)" },
                      "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
                      bgcolor: "rgba(59,130,246,0.05)",
                      borderRadius: "10px",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: "#64748b", "&.Mui-focused": { color: "#3b82f6" } }}>Statut</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Statut"
                    sx={{
                      color: "#94a3b8",
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(59,130,246,0.2)" },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(59,130,246,0.4)" },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
                      bgcolor: "rgba(59,130,246,0.05)",
                      borderRadius: "10px",
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
                  <InputLabel sx={{ color: "#64748b", "&.Mui-focused": { color: "#3b82f6" } }}>Type</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="Type"
                    sx={{
                      color: "#94a3b8",
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(59,130,246,0.2)" },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(59,130,246,0.4)" },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
                      bgcolor: "rgba(59,130,246,0.05)",
                      borderRadius: "10px",
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
        <Card sx={{ bgcolor: "rgba(30,41,59,0.5)", border: "1px solid rgba(59,130,246,0.1)", borderRadius: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "rgba(59,130,246,0.05)", borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 600, borderBottom: "none", width: 56 }}>
                    <Checkbox
                      checked={allRowsSelected}
                      indeterminate={someRowsSelected}
                      onChange={handleToggleSelectAll}
                      sx={{ color: "#94a3b8", '&.Mui-checked': { color: '#3b82f6' } }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 600, borderBottom: "none" }}>N° Facture</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 600, borderBottom: "none" }}>N° Commande Achat</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 600, borderBottom: "none" }}>Fournisseur</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 600, borderBottom: "none" }}>Etat </TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 600, borderBottom: "none" }}>Total HT</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 600, borderBottom: "none" }}>Total TVA</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 600, borderBottom: "none" }}>Total TTC</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 600, borderBottom: "none" }}>Saisi par</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 600, borderBottom: "none" }}>Départ Fournisseur</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 600, borderBottom: "none" }}>Saisi le</TableCell>
                  <TableCell sx={{ color: "#94a3b8", fontWeight: 600, borderBottom: "none" }}>Observations</TableCell>
                 <TableCell sx={{ color: "#94a3b8", fontWeight: 600, borderBottom: "none" }}>Modifier le </TableCell>
                 <TableCell sx={{ color: "#94a3b8", fontWeight: 600, borderBottom: "none" }}>Modifier Par</TableCell>
                 <TableCell sx={{ color: "#94a3b8", fontWeight: 600, borderBottom: "none" }}>Catégories</TableCell>
                 <TableCell sx={{ color: "#94a3b8", fontWeight: 600, borderBottom: "none" }}>Devise</TableCell>
                
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    sx={{
                      borderBottom: "1px solid rgba(59,130,246,0.1)",
                      "&:hover": { bgcolor: "rgba(59,130,246,0.05)" },
                    }}
                  >
                    <TableCell sx={{ color: "white", width: 56 }}>
                      <Checkbox
                        checked={selectedInvoiceIds.includes(invoice.id)}
                        onChange={() => handleToggleRowSelection(invoice.id)}
                        sx={{ color: "#94a3b8", '&.Mui-checked': { color: '#3b82f6' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 500 }}>
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      {invoice.purchase_order_number || invoice.order_number || "-"}
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      {invoice.supplier_name || invoice.customer_name || "-"}
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
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>
                      {formatCurrency(invoice.subtotal || 0, invoice.currency || "EUR")}
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>
                      {formatCurrency(invoice.tax_amount || 0, invoice.currency || "EUR")}
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 700 }}>
                      {formatCurrency(invoice.total_amount || 0, invoice.currency || "EUR")}
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>{invoice.created_by_name || "-"}</TableCell>
                    <TableCell sx={{ color: "white" }}>{formatDate(invoice.supplier_departure_date)}</TableCell>
                    <TableCell sx={{ color: "white" }}>{formatDateTime(invoice.created_at)}</TableCell>
                    <TableCell sx={{ color: "white" }}>{invoice.notes || "-"}</TableCell>
                    <TableCell sx={{ color: "white" }}>{formatDateTime(invoice.updated_at)}</TableCell>
                    <TableCell sx={{ color: "white" }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                        <Typography variant="body2" sx={{ color: "white" }}>
                          {invoice.updated_by_name || invoice.created_by_name || "-"}
                        </Typography>
                        <IconButton
                          onClick={(e) => handleMenuClick(e, invoice)}
                          sx={{ color: "#94a3b8" }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={invoice.category_name || getTypeLabel(invoice.invoice_type)}
                        size="small"
                        sx={{
                          bgcolor: invoice.invoice_type === "sales" ? "#10b98120" : "#f59e0b20",
                          color: invoice.invoice_type === "sales" ? "#10b981" : "#f59e0b",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>{invoice.currency || "EUR"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {invoices.length === 0 && !loading && (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <ReceiptIcon sx={{ fontSize: 64, color: "rgba(255,255,255,0.1)", mb: 2 }} />
              <Typography variant="h6" sx={{ color: "white", mb: 1 }}>Aucune facture trouvée</Typography>
              <Typography sx={{ color: "#64748b" }}>
                {searchQuery || filterStatus !== "all" || filterType !== "all" 
                  ? "Aucune facture ne correspond à vos filtres." 
                  : "Commencez par créer une facture."}
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
            sx: { 
              bgcolor: "rgba(15,23,42,0.97)", 
              border: "1px solid rgba(59,130,246,0.2)", 
              borderRadius: "12px", 
              backdropFilter: "blur(12px)", 
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)" 
            },
          }}
        >
          <MenuItem onClick={() => handleEdit(selectedInvoice)} sx={{ color: "#3b82f6", fontSize: "0.875rem", gap: 1, "&:hover": { bgcolor: "rgba(59,130,246,0.08)" } }}>
            <EditIcon fontSize="small" /> Modifier
          </MenuItem>
          <MenuItem onClick={() => handleExportPDF(selectedInvoice)} sx={{ color: "#10b981", fontSize: "0.875rem", gap: 1, "&:hover": { bgcolor: "rgba(16,185,129,0.08)" } }}>
            <PdfIcon fontSize="small" /> Exporter en PDF
          </MenuItem>
          <MenuItem onClick={() => handleOpenPaymentDialog(selectedInvoice)} sx={{ color: "#f59e0b", fontSize: "0.875rem", gap: 1, "&:hover": { bgcolor: "rgba(245,158,11,0.08)" } }}>
            <PaymentIcon fontSize="small" /> Ajouter un paiement
          </MenuItem>
          <MenuItem onClick={() => handleDelete(selectedInvoice?.id)} sx={{ color: "#ef4444", fontSize: "0.875rem", gap: 1, "&:hover": { bgcolor: "rgba(239,68,68,0.08)" } }}>
            <DeleteIcon fontSize="small" /> Supprimer
          </MenuItem>
        </Menu>

        {/* Add/Edit Invoice Dialog */}
        <Dialog
          open={openAddDialog}
          onClose={() => setOpenAddDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { bgcolor: "#1e293b", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 3, color: "white" } }}
        >
          <DialogTitle sx={{ color: "white", fontWeight: 700, borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
            {formData.id ? "Modifier la facture" : "Nouvelle facture"}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="N° Facture"
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                  sx={{ "& .MuiInputLabel-root": { color: "#94a3b8" }, "& .MuiOutlinedInput-root": { color: "white" } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="N° Commande Achat"
                  value={formData.purchase_order_number}
                  onChange={(e) => setFormData({ ...formData, purchase_order_number: e.target.value })}
                  sx={{ "& .MuiInputLabel-root": { color: "#94a3b8" }, "& .MuiOutlinedInput-root": { color: "white" } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: "#94a3b8" }}>Fournisseur</InputLabel>
                  <Select
                    value={formData.supplier}
                    onChange={(e) => {
                      const selectedSupplier = suppliers.find((s) => s.id === e.target.value);
                      setFormData({
                        ...formData,
                        supplier: e.target.value,
                        customer_name: selectedSupplier?.name || "",
                        customer_email: selectedSupplier?.email || formData.customer_email,
                        customer_phone: selectedSupplier?.phone || formData.customer_phone,
                        customer_address: selectedSupplier?.address || formData.customer_address,
                      });
                    }}
                    label="Fournisseur"
                    sx={{ color: "white" }}
                  >
                    <MenuItem value="">Sélectionner un fournisseur</MenuItem>
                    {suppliers.map((supplier) => (
                      <MenuItem key={supplier.id} value={supplier.id}>{supplier.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: "#94a3b8" }}>Catégorie</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    label="Catégorie"
                    sx={{ color: "white" }}
                  >
                    <MenuItem value="">Aucune</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Devise"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                  sx={{ "& .MuiInputLabel-root": { color: "#94a3b8" }, "& .MuiOutlinedInput-root": { color: "white" } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Départ Fournisseur"
                  type="date"
                  value={formData.supplier_departure_date}
                  onChange={(e) => setFormData({ ...formData, supplier_departure_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
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
                <FormControl fullWidth>
                  <InputLabel sx={{ color: "#94a3b8" }}>TVA (%)</InputLabel>
                  <Select
                    value={formData.tax_rate}
                    onChange={(e) => setFormData({ ...formData, tax_rate: Number(e.target.value) || 0 })}
                    label="TVA (%)"
                    sx={{ color: "white" }}
                  >
                    {taxRateOptions.map((rate) => (
                      <MenuItem key={rate} value={rate}>{rate}%</MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
          PaperProps={{ sx: { bgcolor: "#1e293b", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 3, color: "white" } }}
        >
          <DialogTitle sx={{ color: "white", fontWeight: 700, borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
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
    </Box>
  );
};

export default Facturation;
