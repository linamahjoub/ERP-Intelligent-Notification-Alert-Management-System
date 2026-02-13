import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import notif from '../assets/notif.png';

const ResetPassword = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!newPassword || !newPassword2) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    if (newPassword !== newPassword2) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/auth/password-reset-confirm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid,
          token,
          new_password: newPassword,
          new_password2: newPassword2,
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Lien invalide ou expiré');
      }

      setSuccess('Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              gap: 1
            }}
          >
            <img
              src={notif}
              alt="SmartAlerte Logo"
              width="40"
              height="40"
            />
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontWeight: 'bold',
                color: 'primary.main',
              }}
            >
              SmartAlerte
            </Typography>
          </Box>

          <Typography
            component="h1"
            variant="h5"
            align="center"
            gutterBottom
            sx={{ mb: 3 }}
          >
            Réinitialiser le mot de passe
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="new_password"
              label="Nouveau mot de passe"
              name="new_password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="new_password2"
              label="Confirmer le mot de passe"
              name="new_password2"
              type="password"
              autoComplete="new-password"
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Réinitialiser'}
            </Button>

            <Box textAlign="center">
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button color="primary">
                  Retour à la connexion
                </Button>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPassword;
