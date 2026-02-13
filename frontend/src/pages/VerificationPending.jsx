// Dans VerificationPending.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Checkbox,
  FormControlLabel,
  Divider,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Logout as LogoutIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Verified as VerifiedIcon,
  Support as SupportIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";

const VerificationPending = () => {
  const { user, logout, refreshUser, loading } = useAuth();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [autoRefresh, setAutoRefresh] = React.useState(true);

  // Auto-refresh toutes les 10 secondes pour vérifier l'approbation
  React.useEffect(() => {
    if (!autoRefresh || loading) return;

    const interval = setInterval(async () => {
      setIsRefreshing(true);
      await refreshUser();
      setIsRefreshing(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshUser, loading]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshUser();
    setIsRefreshing(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Rediriger si l'utilisateur est approuvé
  React.useEffect(() => {
    if (!loading && user && user.is_active) {
      // L'utilisateur a été approuvé, rediriger selon le rôle
      setTimeout(() => {
        if (user.is_superuser || user.is_staff) {
          navigate("/admin_dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 1000);
    }
  }, [user?.is_active, loading, navigate, user]);

  // Afficher loader pendant le chargement
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
        }}
      >
        <CircularProgress sx={{ color: "#3b82f6" }} />
      </Box>
    );
  }

  // Si l'utilisateur n'existe pas (ne devrait pas arriver à cause de la redirection)
  if (!user) {
    return null;
  }

  // Si l'utilisateur est actif (ne devrait pas arriver à cause de la redirection)
  if (user.is_active) {
    return null;
  }

  const verificationSteps = [
    {
      label: "Demande soumise",
      status: "completed",
      description: "Votre inscription a été enregistrée avec succès",
    },
    {
      label: "Vérification des informations",
      status: "in_progress",
      description: "Notre équipe examine votre demande",
    },
    {
      label: "Validation finale",
      status: "pending",
      description: "Activation de votre compte en cours",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
        p: 3,
      }}
    >
      {/* ... reste du code (identique à avant) ... */}
      <Box sx={{ maxWidth: 900, width: "100%" }}>
        {/* En-tête professionnel */}
        <Box
          sx={{
            textAlign: "center",
            mb: 4,
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: "rgba(59, 130, 246, 0.1)",
              border: "3px solid rgba(59, 130, 246, 0.3)",
              mb: 2,
            }}
          >
            <HourglassEmptyIcon
              sx={{
                fontSize: 40,
                color: "#3b82f6",
                animation: "pulse 2s ease-in-out infinite",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.5 },
                },
              }}
            />
          </Box>
          <Typography
            variant="h3"
            sx={{
              color: "white",
              fontWeight: 700,
              mb: 1,
              letterSpacing: "-0.02em",
            }}
          >
            Compte en cours de validation
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#94a3b8",
              fontWeight: 400,
            }}
          >
            Merci pour votre patience
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
          {/* Carte principale - Statut */}
          <Card
            sx={{
              bgcolor: "rgba(30, 41, 59, 0.9)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              borderRadius: 3,
              backdropFilter: "blur(10px)",
              gridColumn: { xs: "1", md: "1 / -1" },
            }}
          >
            <CardContent sx={{ p: 4 }}>
              {/* Statut principal */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                  <Typography variant="h5" sx={{ color: "white", fontWeight: 600 }}>
                    Statut de votre demande
                  </Typography>
                  <Chip
                    icon={<AccessTimeIcon sx={{ fontSize: 18 }} />}
                    label="En cours"
                    sx={{
                      bgcolor: "rgba(251, 146, 60, 0.2)",
                      color: "#fb923c",
                      fontWeight: 600,
                      border: "1px solid rgba(251, 146, 60, 0.3)",
                    }}
                  />
                </Box>

                <Alert
                  severity="info"
                  icon={<InfoIcon />}
                  sx={{
                    bgcolor: "rgba(59, 130, 246, 0.1)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    color: "#94a3b8",
                    borderRadius: 2,
                    "& .MuiAlert-icon": {
                      color: "#3b82f6",
                    },
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#e2e8f0", lineHeight: 1.6 }}>
                    Votre demande d'accès est actuellement en cours d'examen par notre équipe administrative.
                    Ce processus de vérification garantit la sécurité et l'intégrité de notre plateforme.
                  </Typography>
                </Alert>
              </Box>

         

             
            </CardContent>
          </Card>

          {/* Carte - Informations du compte */}
          <Card
            sx={{
              bgcolor: "rgba(30, 41, 59, 0.9)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              borderRadius: 3,
              backdropFilter: "blur(10px)",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ color: "white", fontWeight: 600, mb: 3 }}>
                Informations du compte
              </Typography>

              <Stack spacing={2.5}>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <EmailIcon sx={{ color: "#3b82f6", fontSize: 20 }} />
                    <Typography variant="caption" sx={{ color: "#64748b", textTransform: "uppercase", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.05em" }}>
                      Adresse e-mail
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "white",
                      fontWeight: 500,
                      wordBreak: "break-all",
                      pl: 3.5,
                    }}
                  >
                    {user?.email}
                  </Typography>
                </Box>

                {user?.name && (
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <PersonIcon sx={{ color: "#3b82f6", fontSize: 20 }} />
                      <Typography variant="caption" sx={{ color: "#64748b", textTransform: "uppercase", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.05em" }}>
                        Nom complet
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "white",
                        fontWeight: 500,
                        pl: 3.5,
                      }}
                    >
                      {user?.name}
                    </Typography>
                  </Box>
                )}

                {user?.company && (
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <BusinessIcon sx={{ color: "#3b82f6", fontSize: 20 }} />
                      <Typography variant="caption" sx={{ color: "#64748b", textTransform: "uppercase", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.05em" }}>
                        Organisation
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "white",
                        fontWeight: 500,
                        pl: 3.5,
                      }}
                    >
                      {user?.company}
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ bgcolor: "rgba(100, 116, 139, 0.2)", my: 1 }} />

                <Box>
                  <Typography variant="caption" sx={{ color: "#64748b", display: "block", mb: 1, fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Statut du compte
                  </Typography>
                  <Chip
                    icon={<AccessTimeIcon />}
                    label="En attente de validation"
                    size="small"
                    sx={{
                      bgcolor: "rgba(251, 146, 60, 0.2)",
                      color: "#fb923c",
                      fontWeight: 600,
                      border: "1px solid rgba(251, 146, 60, 0.3)",
                    }}
                  />
                </Box>
              </Stack>

              <Divider sx={{ bgcolor: "rgba(100, 116, 139, 0.2)", my: 3 }} />

              {/* Actions rapides */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      sx={{
                        color: "#64748b",
                        "&.Mui-checked": {
                          color: "#3b82f6",
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                      Vérification automatique (toutes les 10s)
                    </Typography>
                  }
                />

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={
                    isRefreshing ? (
                      <CircularProgress size={18} sx={{ color: "white" }} />
                    ) : (
                      <RefreshIcon />
                    )
                  }
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  sx={{
                    bgcolor: "#3b82f6",
                    color: "white",
                    fontWeight: 600,
                    py: 1.5,
                    "&:hover": {
                      bgcolor: "#2563eb",
                    },
                    "&:disabled": {
                      bgcolor: "rgba(59, 130, 246, 0.3)",
                      color: "rgba(255, 255, 255, 0.5)",
                    },
                    textTransform: "none",
                    fontSize: "0.95rem",
                  }}
                >
                  {isRefreshing ? "Vérification en cours..." : "Actualiser le statut"}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{
                    borderColor: "#475569",
                    color: "#94a3b8",
                    fontWeight: 600,
                    py: 1.5,
                    "&:hover": {
                      borderColor: "#64748b",
                      bgcolor: "rgba(148, 163, 184, 0.1)",
                    },
                    textTransform: "none",
                    fontSize: "0.95rem",
                  }}
                >
                  Se déconnecter
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Carte - Support et assistance */}
          <Card
            sx={{
              bgcolor: "rgba(30, 41, 59, 0.9)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              borderRadius: 3,
              backdropFilter: "blur(10px)",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: "rgba(34, 197, 94, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <SupportIcon sx={{ color: "#22c55e", fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
                    Besoin d'aide ?
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    Notre équipe est là pour vous
                  </Typography>
                </Box>
              </Box>

              <Stack spacing={2}>
                <Paper
                  sx={{
                    bgcolor: "rgba(15, 23, 42, 0.5)",
                    border: "1px solid rgba(59, 130, 246, 0.1)",
                    p: 2,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1.5 }}>
                    <strong style={{ color: "white" }}>Questions fréquentes :</strong>
                  </Typography>
                  <List dense sx={{ py: 0 }}>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <CheckCircleIcon sx={{ color: "#3b82f6", fontSize: 16 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="La validation se fait en heures ouvrables"
                        primaryTypographyProps={{
                          variant: "body2",
                          sx: { color: "#94a3b8", fontSize: "0.85rem" },
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <CheckCircleIcon sx={{ color: "#3b82f6", fontSize: 16 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Vous recevrez un e-mail de confirmation"
                        primaryTypographyProps={{
                          variant: "body2",
                          sx: { color: "#94a3b8", fontSize: "0.85rem" },
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <CheckCircleIcon sx={{ color: "#3b82f6", fontSize: 16 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Aucune action requise de votre part"
                        primaryTypographyProps={{
                          variant: "body2",
                          sx: { color: "#94a3b8", fontSize: "0.85rem" },
                        }}
                      />
                    </ListItem>
                  </List>
                </Paper>

                <Box
                  sx={{
                    bgcolor: "rgba(59, 130, 246, 0.1)",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                    borderRadius: 2,
                    p: 2.5,
                    textAlign: "center",
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#94a3b8", mb: 2 }}>
                    Validation urgente ou problème technique ?
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<EmailIcon />}
                    fullWidth
                    sx={{
                      borderColor: "#3b82f6",
                      color: "#3b82f6",
                      fontWeight: 600,
                      "&:hover": {
                        borderColor: "#2563eb",
                        bgcolor: "rgba(59, 130, 246, 0.1)",
                      },
                      textTransform: "none",
                      mb: 1,
                    }}
                    href="mailto:support@example.com"
                  >
                    Contacter le support
                  </Button>
                  <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                    support@example.com
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Footer */}
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
              fontSize: "0.85rem",
              lineHeight: 1.6,
            }}
          >
            Merci de votre confiance. Cette étape de sécurité est essentielle pour garantir
            <br />
            la protection de vos données et l'intégrité de notre plateforme.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default VerificationPending;