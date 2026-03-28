import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Logout as LogoutIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
// ✅ CORRECTION 1 : Vérifiez le chemin (../../ depuis src/pages/auth/)
import { useAuth } from "../../context/AuthContext";

const VerificationPending = () => {
  const { user, logout, refreshUser, loading } = useAuth();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  // ✅ CORRECTION 2 : Ajout d'un état mounted pour éviter les renders prématurés
  const [mounted, setMounted] = useState(false);

  // ✅ Marquer comme monté
  useEffect(() => {
    setMounted(true);
    // ✅ DEBUG : Voir l'état de user
    console.log("🔍 VerificationPending mounted - user:", user, "loading:", loading);
  }, []);

  // Auto-refresh toutes les 10 secondes
  useEffect(() => {
    if (!autoRefresh || loading || !mounted) return;

    const interval = setInterval(async () => {
      setIsRefreshing(true);
      try {
        await refreshUser();
      } catch (err) {
        console.error("Erreur refresh:", err);
      }
      setIsRefreshing(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshUser, loading, mounted]);

  // Redirection quand le compte est activé
  useEffect(() => {
    if (!loading && mounted && user) {
      // ✅ CORRECTION 3 : Comparaison explicite avec === true
      if (user.is_active === true) {
        setShowSuccess(true);
        const timer = setTimeout(() => {
          if (user.is_superuser || user.is_staff) {
            navigate("/admin_dashboard");
          } else {
            navigate("/dashboard");
          }
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [user?.is_active, loading, navigate, user, mounted]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUser();
    } catch (err) {
      console.error("Erreur refresh manuel:", err);
    }
    setIsRefreshing(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ✅ CORRECTION 4 : Toujours afficher un contenu, jamais null
  if (loading || !mounted) {
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
        <Card sx={{ p: 4, textAlign: "center", bgcolor: "rgba(30, 41, 59, 0.9)", borderRadius: 3 }}>
          <CircularProgress sx={{ color: "#3b82f6", mb: 2 }} />
          <Typography sx={{ color: "white" }}>Chargement...</Typography>
        </Card>
      </Box>
    );
  }

  // Si le compte est activé
  if (showSuccess || user?.is_active === true) {
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
        <Card
          sx={{
            p: 4,
            textAlign: "center",
            bgcolor: "rgba(30, 41, 59, 0.9)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: 3,
            maxWidth: 400,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 60, color: "#10b981", mb: 2 }} />
          <Typography variant="h5" sx={{ color: "white", fontWeight: 600, mb: 2 }}>
            Compte activé !
          </Typography>
          <Typography variant="body1" sx={{ color: "#94a3b8", mb: 3 }}>
            Votre compte a été validé avec succès.
            <br />
            Redirection vers votre dashboard...
          </Typography>
          <CircularProgress size={30} sx={{ color: "#3b82f6" }} />
        </Card>
      </Box>
    );
  }

  // ✅ CORRECTION 5 : Si user n'existe pas, afficher un message au lieu de null
  if (!user) {
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
        <Card
          sx={{
            p: 4,
            textAlign: "center",
            bgcolor: "rgba(30, 41, 59, 0.9)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: 3,
            maxWidth: 400,
          }}
        >
          <WarningIcon sx={{ fontSize: 60, color: "#ef4444", mb: 2 }} />
          <Typography variant="h5" sx={{ color: "white", fontWeight: 600, mb: 2 }}>
            Session expirée
          </Typography>
          <Typography variant="body1" sx={{ color: "#94a3b8", mb: 3 }}>
            Veuillez vous reconnecter pour accéder à cette page.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/login")}
            sx={{ bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" } }}
          >
            Se reconnecter
          </Button>
        </Card>
      </Box>
    );
  }

  // ✅ Affichage principal : votre design préservé
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
      <Box sx={{ maxWidth: 900, width: "100%" }}>
        {/* En-tête */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
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
          <Typography variant="h3" sx={{ color: "white", fontWeight: 700, mb: 1 }}>
            Compte en cours de validation
          </Typography>
          <Typography variant="h6" sx={{ color: "#94a3b8", fontWeight: 400 }}>
            Merci pour votre patience
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
          {/* Carte statut */}
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
              <Box sx={{ mb: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 3,
                  }}
                >
                  <Typography variant="h5" sx={{ color: "white", fontWeight: 600 }}>
                    Statut de votre demande
                  </Typography>
                  <Chip
                    icon={<AccessTimeIcon sx={{ fontSize: 18 }} />}
                    label="En attente"
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
                  }}
                >
                  Votre demande est en cours d'examen par notre équipe.
                  Vous recevrez un email à <strong>{user?.email}</strong> dès que votre compte sera activé.
                </Alert>
              </Box>
            </CardContent>
          </Card>

          {/* Carte informations */}
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
                Vos informations
              </Typography>

              <Stack spacing={2.5}>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <EmailIcon sx={{ color: "#3b82f6", fontSize: 20 }} />
                    <Typography variant="caption" sx={{ color: "#64748b", textTransform: "uppercase" }}>
                      Email
                    </Typography>
                  </Box>
                  <Typography sx={{ color: "white", pl: 3.5 }}>
                    {user?.email || "Non renseigné"}
                  </Typography>
                </Box>

                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <PersonIcon sx={{ color: "#3b82f6", fontSize: 20 }} />
                    <Typography variant="caption" sx={{ color: "#64748b", textTransform: "uppercase" }}>
                      Nom d'utilisateur
                    </Typography>
                  </Box>
                  <Typography sx={{ color: "white", pl: 3.5 }}>
                    {user?.username || "Non renseigné"}
                  </Typography>
                </Box>

                <Divider sx={{ bgcolor: "rgba(100, 116, 139, 0.2)" }} />

                <Box>
                  <Chip
                    icon={<AccessTimeIcon />}
                    label="En attente de validation"
                    sx={{
                      bgcolor: "rgba(251, 146, 60, 0.2)",
                      color: "#fb923c",
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Stack>

              <Divider sx={{ bgcolor: "rgba(100, 116, 139, 0.2)", my: 3 }} />

              {/* Boutons d'action */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      sx={{ color: "#64748b" }}
                    />
                  }
                  label={<Typography sx={{ color: "#94a3b8" }}>Vérification auto (10s)</Typography>}
                />

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={isRefreshing ? <CircularProgress size={18} /> : <RefreshIcon />}
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  sx={{
                    bgcolor: "#3b82f6",
                    color: "white",
                    py: 1.5,
                    "&:hover": { bgcolor: "#2563eb" },
                  }}
                >
                  {isRefreshing ? "Vérification..." : "Actualiser"}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{
                    borderColor: "#475569",
                    color: "#94a3b8",
                    py: 1.5,
                  }}
                >
                  Se déconnecter
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Carte support */}
          <Card
            sx={{
              bgcolor: "rgba(30, 41, 59, 0.9)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ color: "white", fontWeight: 600, mb: 3 }}>
                Support
              </Typography>
              
              <Button
                variant="outlined"
                startIcon={<EmailIcon />}
                fullWidth
                sx={{
                  borderColor: "#3b82f6",
                  color: "#3b82f6",
                  py: 1.5,
                }}
                href="mailto:support@votreapp.com"
              >
                Contacter le support
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default VerificationPending;