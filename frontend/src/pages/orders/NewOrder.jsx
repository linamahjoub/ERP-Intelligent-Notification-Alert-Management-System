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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import SharedSidebar from "../../components/SharedSidebar";
import Aurora from "../../components/Aurora/Aurora";

const NewOrder = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    shipping_address: "",
    shipping_method: "Standard",
    notes: "",
  });

  const [newItem, setNewItem] = useState({
    product_id: "",
    quantity: 1,
    unit_price: 0,
    notes: "",
  });
  const [prefillApplied, setPrefillApplied] = useState(false);

  const PRODUCTS_API = "http://localhost:8000/api/stock/products/";
  const ORDERS_API = "http://localhost:8000/api/orders/orders/";

  // Récupère les produits
  useEffect(() => {
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
          setProducts(items);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des produits:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const prefilledProductId = location.state?.prefilledProduct?.id;
    if (!prefilledProductId || prefillApplied || products.length === 0) {
      return;
    }

    const matchedProduct = products.find((p) => p.id === prefilledProductId);
    if (!matchedProduct) {
      return;
    }

    setNewItem((prev) => ({
      ...prev,
      product_id: String(matchedProduct.id),
      unit_price: parseFloat(matchedProduct.price) || 0,
    }));
    setPrefillApplied(true);
  }, [location.state, prefillApplied, products]);

  const handleAddItem = () => {
    if (!newItem.product_id || newItem.quantity <= 0) {
      setErrorMessage("Chaque article doit avoir un produit et une quantité.");
      return;
    }

    const product = products.find((p) => p.id === parseInt(newItem.product_id));
    if (!product) {
      setErrorMessage("Produit introuvable. Veuillez recharger la liste des produits.");
      return;
    }

    const requestedQuantity = Number(newItem.quantity) || 0;
    const availableStock = Number(product.quantity ?? 0);
    const alreadyRequested = items
      .filter((item) => Number(item.product_id) === Number(product.id))
      .reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const totalRequested = requestedQuantity + alreadyRequested;

    if (totalRequested > availableStock) {
      setErrorMessage(
        `Quantite demandee depassee pour \"${product.name}\". Disponible: ${availableStock}, demandee: ${totalRequested}.`
      );
      return;
    }

    items.push({
      product_id: newItem.product_id,
      product,
      quantity: newItem.quantity,
      unit_price: newItem.unit_price || parseFloat(product.price) || 0,
      notes: newItem.notes,
    });

    setItems([...items]);
    setNewItem({
      product_id: "",
      quantity: 1,
      unit_price: 0,
      notes: "",
    });

    setSuccessMessage("Article ajouté à la commande");
  };

  const handleRemoveItem = (index) => {
    items.splice(index, 1);
    setItems([...items]);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  };

  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      setErrorMessage("Ajoutez au moins un article à la commande");
      return;
    }

    // Validation finale cote UI: la quantite commandee ne doit pas depasser le stock disponible.
    const totalByProduct = items.reduce((acc, item) => {
      const key = Number(item.product_id);
      acc[key] = (acc[key] || 0) + (Number(item.quantity) || 0);
      return acc;
    }, {});

    for (const [productId, totalRequested] of Object.entries(totalByProduct)) {
      const product = products.find((p) => Number(p.id) === Number(productId));
      const availableStock = Number(product?.quantity ?? 0);
      if (!product || Number(totalRequested) > availableStock) {
        setErrorMessage(
          `Impossible de passer la commande: la quantite demandee pour \"${product?.name || "ce produit"}\" depasse le stock disponible (${availableStock}).`
        );
        return;
      }
    }

    if (!formData.shipping_address) {
      setErrorMessage("L'adresse de livraison est obligatoire");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      const payload = {
        shipping_address: formData.shipping_address,
        shipping_method: formData.shipping_method,
        notes: formData.notes,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          notes: item.notes,
        })),
      };

      const response = await fetch(ORDERS_API, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error("Backend error:", errorData);
          const errorMessage = errorData.detail || errorData.items?.[0] || JSON.stringify(errorData);
          setErrorMessage(errorMessage || "Erreur lors de la création de la commande");
        } catch {
          const errorText = await response.text();
          console.error("Raw error:", errorText);
          setErrorMessage(errorText || "Erreur lors de la création de la commande");
        }
        return;
      }

      setSuccessMessage("Commande créée avec succès!");
      setTimeout(() => {
        navigate("/orders");
      }, 2000);
    } catch (error) {
      setErrorMessage("Erreur réseau lors de la création de la commande");
    } finally {
      setLoading(false);
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

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "black", overflow: "hidden", position: "relative" }}>
      {/* Aurora Background */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          pointerEvents: "none",
          opacity: 0.4,
        }}
      >
        <Aurora
          colorStops={["#66a1ff", "#B19EEF", "#5227FF"]}
          blend={0.5}
          amplitude={1.0}
          speed={1}
        />
      </Box>

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
          overflowY: "auto",
          overflowX: "hidden",
          position: "relative",
          zIndex: 1,
        }}
      >
        
        {/* Header bar */}
          {/* Back + Title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <IconButton onClick={() => navigate("/orders")} sx={{ color: "#64748b" }}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" sx={{ color: "white", fontWeight: 700 }}>
                Nouvelle Commande
              </Typography>
            </Box>
        
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
              </Box>
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
        

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, gap: 3 }}>
            {/* Formulaire */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Adresse */}
              <Card sx={{ bgcolor: "rgba(30,41,59,0.5)", border: "1px solid rgba(59,130,246,0.1)", borderRadius: 3 }}>
                <CardContent sx={{ pb: 2 }}>
                  <Typography variant="h6" sx={{ color: "white", fontWeight: 600, mb: 2 }}>
                    Informations de Livraison
                  </Typography>

                  <TextField
                    label="Adresse de livraison"
                    value={formData.shipping_address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shipping_address: e.target.value,
                      })
                    }
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    sx={inputSx}
                    required
                  />

                  <TextField
                    label="Méthode de livraison"
                    value={formData.shipping_method}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shipping_method: e.target.value,
                      })
                    }
                    fullWidth
                    size="small"
                    sx={{ ...inputSx, mt: 2 }}
                  />

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
                    rows={2}
                    size="small"
                    sx={{ ...inputSx, mt: 2 }}
                  />
                </CardContent>
              </Card>

              {/* Articles */}
              <Card sx={{ bgcolor: "rgba(30,41,59,0.5)", border: "1px solid rgba(59,130,246,0.1)", borderRadius: 3 }}>
                <CardContent sx={{ pb: 2 }}>
                  <Typography variant="h6" sx={{ color: "white", fontWeight: 600, mb: 2 }}>
                    Ajouter des Articles
                  </Typography>

                  <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                    <InputLabel sx={{ color: "#64748b" }}>Produit</InputLabel>
                    <Select
                      value={newItem.product_id}
                      label="Produit"
                      onChange={(e) => {
                        const product = products.find((p) => p.id === parseInt(e.target.value));
                        setNewItem({
                          ...newItem,
                          product_id: e.target.value,
                          unit_price: parseFloat(product?.price) || 0,
                        });
                      }}
                      sx={{
                        ...inputSx,
                        "& .MuiSelect-select": { color: "white" },
                        "& .MuiSvgIcon-root": { color: "#94a3b8" },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            bgcolor: "#3B82F633",
                            border: "1px solid #3B82F633",
                            borderRadius: "10px",
                            backdropFilter: "blur(12px)",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                          },
                        },
                      }}
                    >
                      <MenuItem value="" sx={{ color: "#000000" }}>
                        Sélectionner un produit
                      </MenuItem>
                      {products.map((product) => (
                        <MenuItem key={product.id} value={product.id} sx={{ color: "white" }}>
                          {product.name} ({product.sku}) - {parseFloat(product.price).toFixed(2)} $
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Quantité"
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                    fullWidth
                    size="small"
                    sx={{ ...inputSx, mb: 1.5 }}
                  />

                  <TextField
                    label="Prix unitaire"
                    type="number"
                    value={newItem.unit_price}
                    InputProps={{ readOnly: true }}
                    fullWidth
                    size="small"
                    sx={{ ...inputSx, mb: 1.5 }}
                  />

                  <TextField
                    label="Notes"
                    value={newItem.notes}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        notes: e.target.value,
                      })
                    }
                    fullWidth
                    size="small"
                    sx={{ ...inputSx, mb: 1.5 }}
                  />

                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddItem}
                    fullWidth
                    sx={{
                      bgcolor: "#3b82f6",
                      color: "white",
                      fontWeight: 600,
                      textTransform: "none",
                      borderRadius: 2,
                      "&:hover": { bgcolor: "#2563eb" },
                    }}
                  >
                    Ajouter l'article
                  </Button>
                </CardContent>
              </Card>
            </Box>

            {/* Résumé */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Card sx={{ bgcolor: "rgba(30,41,59,0.5)", border: "1px solid rgba(59,130,246,0.1)", borderRadius: 3, position: "sticky", top: 20 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: "white", fontWeight: 600, mb: 2 }}>
                    Résumé Commande
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      Articles ({items.length})
                    </Typography>
                    {items.length === 0 ? (
                      <Typography sx={{ color: "#94a3b8", fontSize: "0.85rem", mt: 1 }}>
                        Aucun article ajouté
                      </Typography>
                    ) : (
                      <TableContainer sx={{ mt: 1 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ color: "#64748b", fontSize: "0.75rem" }}>
                                Produit
                              </TableCell>
                              <TableCell align="center" sx={{ color: "#64748b", fontSize: "0.75rem" }}>
                                Qty
                              </TableCell>
                              <TableCell align="right" sx={{ color: "#64748b", fontSize: "0.75rem" }}>
                                Prix
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {items.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell sx={{ color: "#94a3b8", fontSize: "0.75rem", py: 0.5 }}>
                                  {item.product?.name}
                                  <IconButton
                                    size="small"
                                    onClick={() => handleRemoveItem(idx)}
                                    sx={{ ml: 1, color: "#ef4444", display: "inline" }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                                <TableCell align="center" sx={{ color: "#94a3b8", fontSize: "0.75rem", py: 0.5 }}>
                                  {item.quantity}
                                </TableCell>
                                <TableCell align="right" sx={{ color: "white", fontSize: "0.75rem", py: 0.5, fontWeight: 600 }}>
                                  {(item.quantity * item.unit_price).toFixed(2)} $
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>

                  <Box
                    sx={{
                      bgcolor: "rgba(59,130,246,0.1)",
                      p: 1.5,
                      borderRadius: 1,
                      my: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2" sx={{ color: "#64748b" }}>
                        Sous-total
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                        {calculateTotal().toFixed(2)} $
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2" sx={{ color: "#64748b" }}>
                        Frais de port
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                        0,00 $
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderTop: "1px solid rgba(59,130,246,0.2)",
                        pt: 1,
                      }}
                    >
                      <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>
                        Total
                      </Typography>
                      <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>
                        {calculateTotal().toFixed(2)} $
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSubmitOrder}
                    disabled={loading || items.length === 0 || !formData.shipping_address}
                    sx={{
                      bgcolor: "#10b981",
                      color: "white",
                      fontWeight: 600,
                      textTransform: "none",
                      borderRadius: 2,
                      mb: 1,
                      "&:hover": { bgcolor: "#059669" },
                    }}
                  >
                    Passer la commande
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate("/orders")}
                    sx={{
                      color: "#64748b",
                      borderColor: "rgba(59,130,246,0.2)",
                      textTransform: "none",
                      borderRadius: 2,
                      "&:hover": { borderColor: "rgba(59,130,246,0.4)" },
                    }}
                  >
                    Annuler
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
      </Box>

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

export default NewOrder;
