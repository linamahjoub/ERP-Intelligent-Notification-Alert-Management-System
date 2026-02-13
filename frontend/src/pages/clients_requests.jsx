import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
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
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Search as SearchIcon,
  Menu as MenuIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import SharedSidebar from "../components/SharedSidebar";

const ClientsRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");

  const [requestsData, setRequestsData] = useState({
    pendingRequests: [],
    approvedRequests: [],
    rejectedRequests: [],
    stats: {
      totalRequests: 0,
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
    },
  });

  // Récupérer les demandes des clients
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");

        // Récupérer TOUS les utilisateurs
        const response = await fetch("http://localhost:8000/api/admin/users/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const allUsers = await response.json();

          // Catégoriser les utilisateurs par statut d'activation
          const pending = allUsers.filter((u) => !u.is_active && !u.is_superuser);
          const approved = allUsers.filter((u) => u.is_active && !u.is_superuser);
          const rejected = []; // On peut ajouter une logique pour les rejetés si nécessaire

          setRequestsData({
            pendingRequests: pending,
            approvedRequests: approved,
            rejectedRequests: rejected,
            stats: {
              totalRequests: allUsers.filter((u) => !u.is_superuser).length,
              pendingCount: pending.length,
              approvedCount: approved.length,
              rejectedCount: rejected.length,
            },
          });

          if (pending.length === 0 && approved.length === 0) {
            console.log("Aucune demande client trouvée");
          }
        } else {
          console.error("Erreur lors de la récupération des données:", response.status);
          setErrorMessage("Impossible de charger les demandes");
        }
      } catch (err) {
        console.error("Erreur:", err);
        setErrorMessage("Erreur lors du chargement des demandes");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleApproveRequest = (request) => {
    setSelectedRequest(request);
    setConfirmAction("approve");
    setConfirmDialogOpen(true);
  };

  const handleRejectRequest = (request) => {
    setSelectedRequest(request);
    setConfirmAction("reject");
    setConfirmDialogOpen(true);
  };

  const confirmAction_Submit = async () => {
    if (!selectedRequest || !confirmAction) return;

    try {
      const token = localStorage.getItem("access_token");
      
      // Utiliser les endpoints d'approbation et rejet
      const endpoint =
        confirmAction === "approve"
          ? `http://localhost:8000/api/admin/users/${selectedRequest.id}/approve/`
          : `http://localhost:8000/api/admin/users/${selectedRequest.id}/reject/`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        
        setSuccessMessage(
          result.message || 
          `Demande ${confirmAction === "approve" ? "approuvée" : "rejetée"} avec succès`
        );

        // Mise à jour local de l'état
        if (confirmAction === "approve") {
          // Déplacer de pending à approved
          setRequestsData((prev) => ({
            ...prev,
            pendingRequests: prev.pendingRequests.filter(
              (r) => r.id !== selectedRequest.id
            ),
            approvedRequests: [...prev.approvedRequests, { ...selectedRequest, is_active: true }],
            stats: {
              ...prev.stats,
              pendingCount: prev.stats.pendingCount - 1,
              approvedCount: prev.stats.approvedCount + 1,
            },
          }));
        } else {
          // Supprimer de la liste (rejet)
          setRequestsData((prev) => ({
            ...prev,
            pendingRequests: prev.pendingRequests.filter(
              (r) => r.id !== selectedRequest.id
            ),
            stats: {
              ...prev.stats,
              pendingCount: prev.stats.pendingCount - 1,
              totalRequests: prev.stats.totalRequests - 1,
            },
          }));
        }
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || `Erreur lors de l'${confirmAction === "approve" ? "approbation" : "rejet"}`);
      }
    } catch (err) {
      console.error("Erreur:", err);
      setErrorMessage("Erreur lors du traitement");
    } finally {
      setConfirmDialogOpen(false);
      setSelectedRequest(null);
      setConfirmAction(null);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    window.location.reload();
  };

  // Vérifications initiales
  if (!user) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          bgcolor: "black",
        }}
      >
        <Typography variant="h4" sx={{ color: "white" }}>
          Chargement...
        </Typography>
      </Box>
    );
  }

  const isAdmin = user?.is_superuser || user?.is_staff;
  if (!isAdmin) {
    navigate("/dashboard");
    return null;
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          bgcolor: "black",
        }}
      >
        <CircularProgress sx={{ color: "#3b82f6" }} />
      </Box>
    );
  }

  // Obtenir les demandes à afficher
  const getFilteredRequests = () => {
    let requests = [];
    if (filterStatus === "pending") {
      requests = requestsData.pendingRequests;
    } else if (filterStatus === "approved") {
      requests = requestsData.approvedRequests;
    } else if (filterStatus === "rejected") {
      requests = requestsData.rejectedRequests;
    }

    // Filtrer par recherche
    return requests.filter(
      (request) =>
        request.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.first_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.last_name || "").toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  const filteredRequests = getFilteredRequests();

  // RENDER PRINCIPAL
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "black" }}>
      {/* Sidebar partagé */}
      <SharedSidebar
        mobileOpen={mobileOpen}
        onMobileClose={handleDrawerToggle}
      />

      {/* Contenu principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          minHeight: "100vh",
          bgcolor: "black",
          overflowY: "auto",
          overflowX: "hidden",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            bgcolor: "rgba(15, 23, 42, 0.4)",
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "rgba(59, 130, 246, 0.3)",
            borderRadius: "4px",
            "&:hover": {
              bgcolor: "rgba(59, 130, 246, 0.5)",
            },
          },
        }}
      >
        {/* En-tête */}
        <Box
          sx={{
            p: 1.2,
            borderBottom: "1px solid rgba(59, 130, 246, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          {/* Menu mobile icon */}
          {isMobile && (
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                color: "white",
                mr: 1,
                "&:hover": {
                  bgcolor: "rgba(59, 130, 246, 0.1)",
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Barre de recherche */}
          <Box
            sx={{
              flex: 1,
              maxWidth: 500,
              position: "relative",
            }}
          >
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
              placeholder="Rechercher une demande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px 12px 48px",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                borderRadius: "12px",
                color: "#94a3b8",
                fontSize: "0.9rem",
                outline: "none",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.backgroundColor = "rgba(59, 130, 246, 0.2)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(59, 130, 246, 0.2)";
                e.target.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
              }}
            />
          </Box>

          {/* Boutons d'action */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton
              onClick={handleRefresh}
              sx={{
                color: "#64748b",
                "&:hover": {
                  bgcolor: "rgba(59, 130, 246, 0.1)",
                },
              }}
            >
              <RefreshIcon />
            </IconButton>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  textAlign: "right",
                  display: { xs: "none", sm: "block" },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  {user?.first_name || user?.username}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#64748b",
                    fontSize: "0.75rem",
                  }}
                >
                  Administrateur
                </Typography>
              </Box>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "#ef4444",
                  fontWeight: 600,
                  fontSize: "1rem",
                }}
              >
                {user?.first_name?.charAt(0) ||
                  user?.username?.charAt(0) ||
                  "A"}
              </Avatar>
            </Box>
          </Box>
        </Box>

        {/* Titre de la page */}
        <Box sx={{ p: 3, pb: 0 }}>
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
                sx={{
                  color: "white",
                  fontWeight: 700,
                  mb: 0.5,
                }}
              >
                Demandes des Clients
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  fontSize: "0.95rem",
                }}
              >
                Validation des demandes de création de compte
              </Typography>
            </Box>
          </Box>

          {/* Statistiques */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 3,
              flexWrap: "wrap",
            }}
          >
            <Chip
              label={`En attente: ${requestsData.stats.pendingCount}`}
              onClick={() => setFilterStatus("pending")}
              sx={{
                bgcolor:
                  filterStatus === "pending"
                    ? "rgba(251, 146, 60, 0.2)"
                    : "rgba(251, 146, 60, 0.1)",
                color:
                  filterStatus === "pending" ? "#f59e0b" : "#94a3b8",
                border:
                  filterStatus === "pending"
                    ? "1px solid #f59e0b"
                    : "1px solid rgba(251, 146, 60, 0.2)",
                cursor: "pointer",
                fontWeight: 600,
              }}
            />
            <Chip
              label={`Approuvés: ${requestsData.stats.approvedCount}`}
              onClick={() => setFilterStatus("approved")}
              sx={{
                bgcolor:
                  filterStatus === "approved"
                    ? "rgba(16, 185, 129, 0.2)"
                    : "rgba(16, 185, 129, 0.1)",
                color:
                  filterStatus === "approved" ? "#10b981" : "#94a3b8",
                border:
                  filterStatus === "approved"
                    ? "1px solid #10b981"
                    : "1px solid rgba(16, 185, 129, 0.2)",
                cursor: "pointer",
                fontWeight: 600,
              }}
            />
            <Chip
              label={`Rejetés: ${requestsData.stats.rejectedCount}`}
              onClick={() => setFilterStatus("rejected")}
              sx={{
                bgcolor:
                  filterStatus === "rejected"
                    ? "rgba(239, 68, 68, 0.2)"
                    : "rgba(239, 68, 68, 0.1)",
                color: filterStatus === "rejected" ? "#ef4444" : "#94a3b8",
                border:
                  filterStatus === "rejected"
                    ? "1px solid #ef4444"
                    : "1px solid rgba(239, 68, 68, 0.2)",
                cursor: "pointer",
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>

        {/* Contenu - Liste des demandes */}
        <Box sx={{ p: 3, pt: 2 }}>
          <Card
            sx={{
              bgcolor: "rgba(30, 41, 59, 0.5)",
              border: "1px solid rgba(59, 130, 246, 0.1)",
              borderRadius: 3,
            }}
          >
            {filteredRequests.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{
                        backgroundColor: "rgba(59, 130, 246, 0.05)",
                        borderBottom: "1px solid rgba(59, 130, 246, 0.1)",
                      }}
                    >
                      <TableCell
                        sx={{
                          color: "#94a3b8",
                          fontWeight: 600,
                          fontSize: "0.875rem",
                        }}
                      >
                        Client
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "#94a3b8",
                          fontWeight: 600,
                          fontSize: "0.875rem",
                        }}
                      >
                        Email
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "#94a3b8",
                          fontWeight: 600,
                          fontSize: "0.875rem",
                        }}
                      >
                        Statut
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "#94a3b8",
                          fontWeight: 600,
                          fontSize: "0.875rem",
                        }}
                      >
                        Date d'inscription
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color: "#94a3b8",
                          fontWeight: 600,
                          fontSize: "0.875rem",
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow
                        key={request.id}
                        sx={{
                          borderBottom: "1px solid rgba(59, 130, 246, 0.1)",
                          backgroundColor: "transparent",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: "rgba(59, 130, 246, 0.05)",
                          },
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Avatar
                              sx={{
                                bgcolor: "#3b82f6",
                                fontWeight: 600,
                              }}
                            >
                              {request.first_name?.charAt(0) ||
                                request.username?.charAt(0) ||
                                "U"}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ color: "white", fontWeight: 600 }}
                              >
                                {request.first_name || request.username}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#64748b" }}
                              >
                                @{request.username}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ color: "#94a3b8" }}
                          >
                            {request.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={
                              request.is_active ? (
                                <CheckCircleIcon />
                              ) : (
                                <WarningIcon />
                              )
                            }
                            label={
                              request.is_active ? "Approuvé" : "En attente"
                            }
                            color={
                              request.is_active ? "success" : "warning"
                            }
                            size="small"
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.75rem",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ color: "#94a3b8", fontSize: "0.875rem" }}
                          >
                            {new Date(request.date_joined).toLocaleDateString(
                              "fr-FR",
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {!request.is_active && (
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Button
                                size="small"
                                startIcon={<CheckIcon />}
                                onClick={() => handleApproveRequest(request)}
                                sx={{
                                  color: "#10b981",
                                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                                  border: "1px solid rgba(16, 185, 129, 0.2)",
                                  textTransform: "none",
                                  fontSize: "0.75rem",
                                  "&:hover": {
                                    backgroundColor: "rgba(16, 185, 129, 0.2)",
                                  },
                                }}
                              >
                                Approuver
                              </Button>
                              <Button
                                size="small"
                                startIcon={<CloseIcon />}
                                onClick={() => handleRejectRequest(request)}
                                sx={{
                                  color: "#ef4444",
                                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                                  border: "1px solid rgba(239, 68, 68, 0.2)",
                                  textTransform: "none",
                                  fontSize: "0.75rem",
                                  "&:hover": {
                                    backgroundColor: "rgba(239, 68, 68, 0.2)",
                                  },
                                }}
                              >
                                Rejeter
                              </Button>
                            </Box>
                          )}
                          {request.is_active && (
                            <Chip
                              label="Validé"
                              color="success"
                              size="small"
                              sx={{ fontSize: "0.75rem" }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <CardContent sx={{ textAlign: "center", py: 6 }}>
                <Typography sx={{ color: "#64748b", mb: 2 }}>
                  {searchTerm
                    ? "Aucune demande ne correspond à votre recherche"
                    : `Aucune demande ${filterStatus === "pending" ? "en attente" : filterStatus === "approved" ? "approuvée" : "rejetée"}`}
                </Typography>
              </CardContent>
            )}
          </Card>
        </Box>
      </Box>

      {/* Dialog de confirmation */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: "#1e293b",
            border:
              confirmAction === "approve"
                ? "1px solid rgba(16, 185, 129, 0.2)"
                : "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "white",
            borderBottom:
              confirmAction === "approve"
                ? "1px solid rgba(16, 185, 129, 0.1)"
                : "1px solid rgba(239, 68, 68, 0.1)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {confirmAction === "approve" ? (
              <>
                <CheckIcon sx={{ color: "#10b981" }} />
                Approuver la demande
              </>
            ) : (
              <>
                <CloseIcon sx={{ color: "#ef4444" }} />
                Rejeter la demande
              </>
            )}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography sx={{ color: "#94a3b8", mb: 2 }}>
            Êtes-vous sûr de vouloir{" "}
            <strong style={{ color: "white" }}>
              {confirmAction === "approve" ? "approuver" : "rejeter"}
            </strong>{" "}
            la demande de{" "}
            <strong style={{ color: "white" }}>
              {selectedRequest?.first_name || selectedRequest?.username}
            </strong>
            ?
          </Typography>
          <Alert
            severity={confirmAction === "approve" ? "success" : "warning"}
            sx={{
              bgcolor:
                confirmAction === "approve"
                  ? "rgba(16, 185, 129, 0.1)"
                  : "rgba(251, 146, 60, 0.1)",
              border:
                confirmAction === "approve"
                  ? "1px solid rgba(16, 185, 129, 0.2)"
                  : "1px solid rgba(251, 146, 60, 0.2)",
            }}
          >
            {confirmAction === "approve"
              ? "Le client recevra un email de confirmation et pourra accéder à son compte."
              : "Le client recevra un email de notification et devra refaire une demande."}
          </Alert>
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            borderTop:
              confirmAction === "approve"
                ? "1px solid rgba(16, 185, 129, 0.1)"
                : "1px solid rgba(239, 68, 68, 0.1)",
          }}
        >
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            sx={{
              color: "#94a3b8",
              "&:hover": {
                bgcolor: "rgba(59, 130, 246, 0.1)",
              },
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={confirmAction_Submit}
            variant="contained"
            sx={{
              bgcolor: confirmAction === "approve" ? "#10b981" : "#ef4444",
              color: "white",
              fontWeight: 600,
              "&:hover": {
                bgcolor:
                  confirmAction === "approve" ? "#059669" : "#dc2626",
              },
            }}
          >
            {confirmAction === "approve" ? "Approuver" : "Rejeter"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les messages */}
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

export default ClientsRequests;
