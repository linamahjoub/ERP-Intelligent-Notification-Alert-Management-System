import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EditAlert = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Données du formulaire
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    module: '',
    severity: 'medium',
    conditionType: 'threshold',
    thresholdValue: '',
    comparisonOperator: 'greater_than',
    notificationChannels: ['email'],
    recipients: [],
    schedule: 'immediate',
    customSchedule: '',
    isActive: true,
  });

  const [customRecipient, setCustomRecipient] = useState('');

  // Options pour les sélecteurs
  const modules = [
    { value: 'stock', label: 'Stock', icon: <InventoryIcon /> },
    { value: 'crm', label: 'CRM', icon: <PeopleIcon /> },
    { value: 'facturation', label: 'Facturation', icon: <DescriptionIcon /> },
    { value: 'gmao', label: 'GMAO', icon: <SettingsIcon /> },
    { value: 'gpao', label: 'GPAO', icon: <AssessmentIcon /> },
    { value: 'rh', label: 'Ressources Humaines', icon: <PeopleIcon /> },
  ];

  const severityOptions = [
    { value: 'low', label: 'Basse', color: '#10b981' },
    { value: 'medium', label: 'Moyenne', color: '#3b82f6' },
    { value: 'high', label: 'Haute', color: '#f59e0b' },
    { value: 'critical', label: 'Critique', color: '#ef4444' },
  ];

  const conditionTypes = [
    { value: 'threshold', label: 'Seuil' },
    { value: 'absence', label: 'Absence de données' },
    { value: 'anomaly', label: 'Anomalie' },
    { value: 'custom', label: 'Personnalisée' },
  ];

  const comparisonOperators = [
    { value: 'greater_than', label: 'Supérieur à' },
    { value: 'less_than', label: 'Inférieur à' },
    { value: 'equal_to', label: 'Égal à' },
    { value: 'not_equal', label: 'Différent de' },
    { value: 'between', label: 'Entre' },
  ];

  const notificationChannels = [
    { value: 'email', label: 'Email' },
    { value: 'in-app', label: 'in-app' },
  ];

  const scheduleOptions = [
    { value: 'immediate', label: 'Immédiat' },
    { value: 'hourly', label: 'Toutes les heures' },
    { value: 'daily', label: 'Quotidien' },
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'monthly', label: 'Mensuel' },
    { value: 'custom', label: 'Personnalisé' },
  ];

  // Charger l'alerte existante
  useEffect(() => {
    const loadAlert = () => {
      try {
        const existingAlerts = JSON.parse(localStorage.getItem('alerts') || '[]');
        const alert = existingAlerts.find(a => a.id === id);

        if (alert) {
          setFormData({
            name: alert.name || '',
            description: alert.description || '',
            module: alert.module || '',
            severity: alert.severity || 'medium',
            conditionType: alert.conditionType || 'threshold',
            thresholdValue: alert.thresholdValue || '',
            comparisonOperator: alert.comparisonOperator || 'greater_than',
            notificationChannels: alert.notificationChannels || ['email'],
            recipients: alert.recipients || [],
            schedule: alert.schedule || 'immediate',
            customSchedule: alert.customSchedule || '',
            isActive: alert.isActive !== undefined ? alert.isActive : true,
          });
        } else {
          setSnackbarMessage('Alerte non trouvée');
          setOpenSnackbar(true);
          navigate('/alert_rules');
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        setSnackbarMessage('Erreur lors du chargement de l\'alerte');
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    };

    loadAlert();
  }, [id, navigate]);

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleChannelToggle = (channel) => {
    const currentChannels = [...formData.notificationChannels];
    const index = currentChannels.indexOf(channel);

    if (index === -1) {
      currentChannels.push(channel);
    } else {
      currentChannels.splice(index, 1);
    }

    setFormData({
      ...formData,
      notificationChannels: currentChannels,
    });
  };

  const handleAddRecipient = () => {
    if (customRecipient && !formData.recipients.includes(customRecipient)) {
      setFormData({
        ...formData,
        recipients: [...formData.recipients, customRecipient],
      });
      setCustomRecipient('');
    }
  };

  const handleRemoveRecipient = (recipient) => {
    setFormData({
      ...formData,
      recipients: formData.recipients.filter(r => r !== recipient),
    });
  };

  const handleSubmit = async () => {
    try {
      // Validation basique
      if (!formData.name || !formData.module) {
        setSnackbarMessage('Veuillez remplir tous les champs obligatoires');
        setOpenSnackbar(true);
        return;
      }

      // Récupérer les alertes existantes
      const existingAlerts = JSON.parse(localStorage.getItem('alerts') || '[]');

      // Mettre à jour l'alerte
      const updatedAlerts = existingAlerts.map(alert =>
        alert.id === id ? { ...alert, ...formData, updatedAt: new Date().toISOString() } : alert
      );

      // Sauvegarder dans localStorage
      localStorage.setItem('alerts', JSON.stringify(updatedAlerts));

      console.log('Alerte mise à jour:', { id, ...formData });

      setSnackbarMessage('Règle d\'alerte mise à jour avec succès !');
      setOpenSnackbar(true);

      // Rediriger après 2 secondes
      setTimeout(() => {
        navigate('/alert_rules');
      }, 2000);

    } catch (error) {
      console.error('Erreur:', error);
      setSnackbarMessage('Erreur lors de la mise à jour de la règle');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#0a0e27', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" sx={{ color: 'white' }}>Chargement...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#0a0e27', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton
            onClick={() => navigate('/alert_rules')}
            sx={{
              color: 'white',
              mr: 2,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 600, mb: 0.5 }}>
              Modifier la règle d'alerte
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              Modifiez les paramètres de votre règle de surveillance ERP
            </Typography>
          </Box>
        </Box>

        {/* Formulaire principal */}
        <Paper sx={{
          p: 4,
          mb: 4,
          bgcolor: '#0d1129',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>
          {/* Nom de la règle */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, fontSize: '0.95rem' }}>
              Nom de la règle
            </Typography>
            <TextField
              fullWidth
              placeholder="Ex: Stock Critique Composants"
              variant="outlined"
              value={formData.name}
              onChange={handleInputChange('name')}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#0a0e27',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '0.9rem',
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.2)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
                  },
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(255,255,255,0.3)',
                  opacity: 1,
                },
              }}
            />
          </Box>

          {/* Module ERP */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, fontSize: '0.95rem' }}>
              Module ERP
            </Typography>
            <Grid container spacing={2}>
              {modules.map((module) => (
                <Grid item xs={12} sm={6} md={4} key={module.value}>
                  <Card
                    onClick={() => setFormData({ ...formData, module: module.value })}
                    sx={{
                      bgcolor: formData.module === module.value ? 'rgba(59, 130, 246, 0.15)' : '#0a0e27',
                      border: formData.module === module.value
                        ? '1px solid #3b82f6'
                        : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: '#3b82f6',
                        bgcolor: 'rgba(59, 130, 246, 0.08)',
                      },
                    }}
                  >
                    <CardContent sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      py: 3,
                    }}>
                      <Box sx={{
                        color: formData.module === module.value ? '#3b82f6' : 'rgba(255,255,255,0.5)',
                        mb: 1.5,
                        fontSize: '2rem',
                      }}>
                        {module.icon}
                      </Box>
                      <Typography sx={{
                        color: formData.module === module.value ? 'white' : 'rgba(255,255,255,0.7)',
                        fontWeight: 500,
                        fontSize: '0.9rem',
                      }}>
                        {module.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Priorité */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, fontSize: '0.95rem' }}>
              Priorité
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {severityOptions.map((severity) => (
                <Box
                  key={severity.value}
                  onClick={() => setFormData({ ...formData, severity: severity.value })}
                  sx={{
                    flex: '1 1 0',
                    minWidth: '120px',
                    px: 3,
                    py: 2,
                    borderRadius: 2,
                    border: formData.severity === severity.value
                      ? `1px solid ${severity.color}`
                      : '1px solid rgba(255,255,255,0.1)',
                    bgcolor: formData.severity === severity.value
                      ? `${severity.color}20`
                      : '#0a0e27',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                    '&:hover': {
                      borderColor: severity.color,
                      bgcolor: `${severity.color}15`,
                    },
                  }}
                >
                  <Typography sx={{
                    color: formData.severity === severity.value ? severity.color : 'rgba(255,255,255,0.7)',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                  }}>
                    {severity.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Description (optionnel) */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, fontSize: '0.95rem' }}>
              Description 
            </Typography>
            <TextField
              fullWidth
              placeholder="Décrivez brièvement l'objectif de cette règle..."
              variant="outlined"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleInputChange('description')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#0a0e27',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '0.9rem',
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.2)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6',
                  },
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(255,255,255,0.3)',
                  opacity: 1,
                },
              }}
            />
          </Box>

          <Divider sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.08)' }} />

          {/* Condition de déclenchement */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 3, fontSize: '1rem' }}>
              Condition de déclenchement
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                    Type de condition
                  </InputLabel>
                  <Select
                    value={formData.conditionType}
                    onChange={handleInputChange('conditionType')}
                    label="Type de condition"
                    sx={{
                      bgcolor: '#0a0e27',
                      color: 'white',
                      fontSize: '0.9rem',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.1)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.2)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3b82f6',
                      },
                    }}
                  >
                    {conditionTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                    Opérateur
                  </InputLabel>
                  <Select
                    value={formData.comparisonOperator}
                    onChange={handleInputChange('comparisonOperator')}
                    label="Opérateur"
                    sx={{
                      bgcolor: '#0a0e27',
                      color: 'white',
                      fontSize: '0.9rem',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.1)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.2)',
                      },
                    }}
                  >
                    {comparisonOperators.map((operator) => (
                      <MenuItem key={operator.value} value={operator.value}>
                        {operator.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Valeur du seuil"
                  variant="outlined"
                  type="number"
                  value={formData.thresholdValue}
                  onChange={handleInputChange('thresholdValue')}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#0a0e27',
                      color: 'white',
                      fontSize: '0.9rem',
                      '& fieldset': {
                        borderColor: 'rgba(255,255,255,0.1)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255,255,255,0.2)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '0.9rem',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.08)' }} />

          {/* Notifications */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 3, fontSize: '1rem' }}>
              Configuration des notifications
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2, fontSize: '0.85rem' }}>
                Canaux de notification
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {notificationChannels.map((channel) => (
                  <Chip
                    key={channel.value}
                    label={channel.label}
                    clickable
                    onClick={() => handleChannelToggle(channel.value)}
                    sx={{
                      color: formData.notificationChannels.includes(channel.value) ? 'white' : 'rgba(255,255,255,0.6)',
                      bgcolor: formData.notificationChannels.includes(channel.value) ? '#3b82f6' : 'rgba(255,255,255,0.08)',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      '&:hover': {
                        bgcolor: formData.notificationChannels.includes(channel.value) ? '#2563eb' : 'rgba(255,255,255,0.12)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2, fontSize: '0.85rem' }}>
                Destinataires
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Ajouter un email ou identifiant"
                  value={customRecipient}
                  onChange={(e) => setCustomRecipient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#0a0e27',
                      color: 'white',
                      fontSize: '0.9rem',
                      '& fieldset': {
                        borderColor: 'rgba(255,255,255,0.1)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255,255,255,0.2)',
                      },
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: 'rgba(255,255,255,0.3)',
                      opacity: 1,
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddRecipient}
                  startIcon={<AddIcon />}
                  sx={{
                    bgcolor: '#3b82f6',
                    color: 'white',
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    px: 3,
                    '&:hover': {
                      bgcolor: '#2563eb',
                    },
                  }}
                >
                  Ajouter
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, minHeight: 40 }}>
                {formData.recipients.map((recipient) => (
                  <Chip
                    key={recipient}
                    label={recipient}
                    onDelete={() => handleRemoveRecipient(recipient)}
                    deleteIcon={<DeleteIcon />}
                    sx={{
                      color: 'white',
                      bgcolor: 'rgba(59, 130, 246, 0.2)',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      '& .MuiChip-deleteIcon': {
                        color: 'rgba(255,255,255,0.7)',
                        '&:hover': {
                          color: 'white',
                        },
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.08)' }} />

          {/* Planification */}
          <Box>
            <Typography variant="h6" sx={{ color: 'white', mb: 3, fontSize: '1rem' }}>
              Planification
            </Typography>

            <Grid container spacing={10}>
              <Grid item xs={12} md={12}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                    Fréquence d'exécution
                  </InputLabel>
                  <Select
                    value={formData.schedule}
                    onChange={handleInputChange('schedule')}
                    label="Fréquence d'exécution"
                    sx={{
                      bgcolor: '#0a0e27',
                      color: 'white',
                      fontSize: '0.9rem',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.1)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.2)',
                      },
                    }}
                  >
                    {scheduleOptions.map((schedule) => (
                      <MenuItem key={schedule.value} value={schedule.value}>
                        {schedule.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {formData.schedule === 'custom' && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Expression CRON"
                    variant="outlined"
                    value={formData.customSchedule}
                    onChange={handleInputChange('customSchedule')}
                    placeholder="0 9 * * *"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#0a0e27',
                        color: 'white',
                        fontSize: '0.9rem',
                        '& fieldset': {
                          borderColor: 'rgba(255,255,255,0.1)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '0.9rem',
                      },
                    }}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#3b82f6',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          bgcolor: '#3b82f6',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                      Activer cette règle immédiatement
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Boutons d'action */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/alert_rules')}
            startIcon={<CancelIcon />}
            sx={{
              color: 'rgba(255,255,255,0.7)',
              borderColor: 'rgba(255,255,255,0.2)',
              textTransform: 'none',
              fontSize: '0.9rem',
              px: 3,
              py: 1,
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.4)',
                bgcolor: 'rgba(255,255,255,0.05)',
              },
            }}
          >
            Annuler
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            startIcon={<SaveIcon />}
            disabled={!formData.name || !formData.module}
            sx={{
              bgcolor: '#3b82f6',
              color: 'white',
              textTransform: 'none',
              fontSize: '0.9rem',
              px: 4,
              py: 1,
              '&:hover': {
                bgcolor: '#2563eb',
              },
              '&:disabled': {
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.3)',
              },
            }}
          >
            Mettre à jour la règle
          </Button>
        </Box>
      </Container>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarMessage.includes('Erreur') ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditAlert;
