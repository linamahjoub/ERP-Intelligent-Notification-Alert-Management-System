import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Avatar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import SharedSidebar from "../components/SharedSidebar";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";



const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const History = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activities, setActivities] = useState([]);

  const fetchHistory = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setActivities([]);
        setErrorMessage("Session expirée, reconnectez-vous.");
        return;
      }

      const response = await fetch(`${API_URL}/activity/recent/?limit=100`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          setActivities([]);
          setErrorMessage("Accès refusé : l'historique est réservé aux administrateurs.");
          return;
        }
        const errorText = await response.text();
        throw new Error(errorText || `Erreur API ${response.status}`);
      }

      const data = await response.json();
      const historyList = data.results || (Array.isArray(data) ? data : []);
      setActivities(historyList);
    } catch (error) {
      setErrorMessage("Erreur lors du chargement de l'historique.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredActivities = useMemo(() => {
    if (!searchQuery.trim()) return activities;
    const query = searchQuery.toLowerCase();
    return activities.filter((item) =>
      [item.title, item.description, item.action_type, item.actor_name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [activities, searchQuery]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "black", overflow: "hidden" }}>
      <SharedSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(!mobileOpen)} selectedMenu="history" />

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, height: "100vh", bgcolor: "black", overflowY: "auto", overflowX: "hidden" }}>
        <Box sx={{ p: 1.2, borderBottom: "1px solid rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
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
                Historique
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Journal des actions récentes
              </Typography>
            </Box>
            <IconButton
              onClick={fetchHistory}
              disabled={loading}
              sx={{ color: "#64748b", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "10px", width: 44, height: 44, "&:hover": { color: "#3b82f6", borderColor: "rgba(59,130,246,0.4)" } }}
            >
              <RefreshIcon />
            </IconButton>
          </Box>

          <Card sx={{ bgcolor: "rgba(30,41,59,0.5)", border: "1px solid rgba(59,130,246,0.1)", borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <TextField
                fullWidth
                placeholder="Rechercher dans l'historique..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#64748b" }} />
                    </InputAdornment>
                  ),
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
            </CardContent>
          </Card>

          {errorMessage && (
            <Alert severity="warning" sx={{ mb: 3, bgcolor: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}>
              {errorMessage}
            </Alert>
          )}

          <Card sx={{ bgcolor: "rgba(30,41,59,0.5)", border: "1px solid rgba(59,130,246,0.1)", borderRadius: 3 }}>
            {loading ? (
              <Box sx={{ p: 5, display: "flex", justifyContent: "center" }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "rgba(59,130,246,0.05)", borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
                      <TableCell sx={{ color: "#94a3b8", fontWeight: 600, borderBottom: "none" }}>Titre</TableCell>
                      <TableCell sx={{ color: "#94a3b8", fontWeight: 600, borderBottom: "none" }}>Description</TableCell>
                      <TableCell sx={{ color: "#94a3b8", fontWeight: 600, borderBottom: "none" }}>Utilisateur</TableCell>
                      <TableCell sx={{ color: "#94a3b8", fontWeight: 600, borderBottom: "none" }}>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredActivities.map((item) => (
                      <TableRow key={item.id} sx={{ borderBottom: "1px solid rgba(59,130,246,0.1)", "&:hover": { bgcolor: "rgba(59,130,246,0.05)" } }}>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>{item.title || "-"}</TableCell>
                        <TableCell sx={{ color: "#cbd5e1" }}>{item.description || "-"}</TableCell>
                        <TableCell sx={{ color: "white" }}>{item.actor_name || "System"}</TableCell>
                        <TableCell sx={{ color: "#94a3b8" }}>{formatDateTime(item.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {!loading && filteredActivities.length === 0 && (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <HistoryIcon sx={{ fontSize: 64, color: "rgba(255,255,255,0.1)", mb: 2 }} />
                <Typography variant="h6" sx={{ color: "white", mb: 1 }}>
                  Aucun historique trouvé
                </Typography>
                <Typography sx={{ color: "#64748b" }}>
                  {searchQuery ? "Aucun résultat pour cette recherche." : "Aucune activité disponible pour le moment."}
                </Typography>
              </Box>
            )}
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default History;
