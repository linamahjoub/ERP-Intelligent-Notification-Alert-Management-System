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
  Alert,
  Snackbar,
  Stepper,
  Step,
  StepLabel,
  Fade,
  Stack,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Schedule as ScheduleIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Webhook as WebhookIcon,
  NotificationsActive as NotificationsActiveIcon,
  PlayArrow as PlayArrowIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Build as BuildIcon,
  Factory as FactoryIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  Close as CloseIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NewAlert = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [validationErrors, setValidationErrors] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);

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
    tags: [],
  });

  const [customRecipient, setCustomRecipient] = useState('');

  const modules = [
    { value: 'stock', label: 'Stock', icon: <InventoryIcon />, color: '#4285f4' },
    { value: 'crm', label: 'CRM', icon: <PeopleIcon />, color: '#34A853' },
    { value: 'facturation', label: 'Facturation', icon: <DescriptionIcon />, color: '#FBBC04' },
    { value: 'gmao', label: 'GMAO', icon: <BuildIcon />, color: '#EA4335' },
    { value: 'gpao', label: 'GPAO', icon: <FactoryIcon />, color: '#9C27B0' },
    { value: 'rh', label: 'RH', icon: <PeopleIcon />, color: '#00BCD4' },
  ];

  const severityOptions = [
    { 
      value: 'critical', 
      label: 'Critique',  
      color: '#dc3545',
    },
    { 
      value: 'high', 
      label: 'Haute', 
      color: '#fd7e14',
    },
    { 
      value: 'medium', 
      label: 'Moyenne',  
      color: '#0dcaf0',
    },
    { 
      value: 'low', 
      label: 'Basse',  
      color: '#198754',
    },
  ];

  const conditionTypes = [
    { value: 'threshold', label: 'Seuil', icon: <SpeedIcon />, description: 'Déclencher quand une valeur dépasse un seuil' },
    { value: 'absence', label: 'Absence de données', icon: <ErrorIcon />, description: 'Déclencher en cas de données manquantes' },
    { value: 'anomaly', label: 'Détection d\'anomalie', icon: <TimelineIcon />, description: 'Déclencher sur comportement anormal' },
    { value: 'trend', label: 'Tendance', icon: <TrendingUpIcon />, description: 'Déclencher sur évolution de tendance' },
  ];

  const comparisonOperators = [
    { value: 'greater_than', label: 'Supérieur à', symbol: '>' },
    { value: 'less_than', label: 'Inférieur à', symbol: '<' },
    { value: 'equal_to', label: 'Égal à', symbol: '=' },
    { value: 'not_equal', label: 'Différent de', symbol: '≠' },
    { value: 'greater_equal', label: 'Supérieur ou égal', symbol: '≥' },
    { value: 'less_equal', label: 'Inférieur ou égal', symbol: '≤' },
  ];

  const notificationChannels = [
    { value: 'email', label: 'Email', icon: <EmailIcon />, color: '#EA4335' },
    { value: 'slack', label: 'Slack', icon: <NotificationsIcon />, color: '#4A154B' },
    { value: 'teams', label: 'Teams', icon: <NotificationsIcon />, color: '#5558AF' },
    { value: 'webhook', label: 'Webhook', icon: <WebhookIcon />, color: '#4285f4' },
    { value: 'sms', label: 'SMS', icon: <SmsIcon />, color: '#34A853' },
    { value: 'push', label: 'Push', icon: <NotificationsActiveIcon />, color: '#FBBC04' },
  ];

  const scheduleOptions = [
    { value: 'immediate', label: 'Temps réel', icon: <PlayArrowIcon />, description: 'Vérification continue' },
    { value: 'hourly', label: 'Toutes les heures', icon: <ScheduleIcon />, description: 'Vérification horaire' },
    { value: 'daily', label: 'Quotidien', icon: <ScheduleIcon />, description: 'Une fois par jour' },
    { value: 'weekly', label: 'Hebdomadaire', icon: <ScheduleIcon />, description: 'Une fois par semaine' },
    { value: 'monthly', label: 'Mensuel', icon: <ScheduleIcon />, description: 'Une fois par mois' },
  ];

  const steps = ['Informations de base', 'Conditions', 'Notifications'];

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 0) {
      if (!formData.name.trim()) errors.name = 'Le nom est requis';
      if (!formData.module) errors.module = 'Veuillez sélectionner un module';
    }
    
    if (step === 1) {
      if (!formData.thresholdValue) {
        errors.thresholdValue = 'Cette valeur est requise pour le type de condition sélectionné';
      }
    }
    
    if (step === 2) {
      if (formData.notificationChannels.length === 0) {
        errors.channels = 'Sélectionnez au moins un canal';
      }
      if (formData.recipients.length === 0) {
        errors.recipients = 'Ajoutez au moins un destinataire';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      [field]: value,
    });
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: undefined });
    }
  };

  const handleChannelToggle = (channel) => {
    const currentChannels = [...formData.notificationChannels];
    const index = currentChannels.indexOf(channel);
    
    if (index === -1) {
      currentChannels.push(channel);
    } else {
      if (currentChannels.length > 1) {
        currentChannels.splice(index, 1);
      } else {
        setSnackbarMessage('Au moins un canal doit être sélectionné');
        setSnackbarSeverity('warning');
        setOpenSnackbar(true);
        return;
      }
    }
    
    setFormData({
      ...formData,
      notificationChannels: currentChannels,
    });
    if (validationErrors.channels) {
      setValidationErrors({ ...validationErrors, channels: undefined });
    }
  };

  const handleAddRecipient = () => {
    if (customRecipient && !formData.recipients.includes(customRecipient)) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(customRecipient) || customRecipient.startsWith('@')) {
        setFormData({
          ...formData,
          recipients: [...formData.recipients, customRecipient],
        });
        setCustomRecipient('');
        if (validationErrors.recipients) {
          setValidationErrors({ ...validationErrors, recipients: undefined });
        }
      } else {
        setSnackbarMessage('Format d\'email invalide');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    }
  };

  const handleRemoveRecipient = (recipient) => {
    setFormData({
      ...formData,
      recipients: formData.recipients.filter(r => r !== recipient),
    });
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveStep((prevStep) => prevStep + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      setSnackbarMessage('Veuillez remplir tous les champs requis');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleBack = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setActiveStep((prevStep) => prevStep - 1);
      setIsAnimating(false);
    }, 200);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      setSnackbarMessage('Veuillez vérifier tous les champs');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      
      // Préparer les données pour l'API
      const alertData = {
        name: formData.name,
        description: formData.description,
        module: formData.module,
        severity: formData.severity,
        condition_type: formData.conditionType,
        threshold_value: formData.thresholdValue,
        comparison_operator: formData.comparisonOperator,
        notification_channels: formData.notificationChannels,
        recipients: formData.recipients,
        schedule: formData.schedule,
        custom_schedule: formData.customSchedule,
        is_active: formData.isActive,
        tags: formData.tags,
      };
      
      // Envoyer au serveur
      const response = await fetch('http://localhost:8000/api/alerts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(alertData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création de l\'alerte');
      }
      
      const result = await response.json();
      
      setSnackbarMessage('Règle d\'alerte créée avec succès !');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      
      setTimeout(() => {
        navigate('/alerts');
      }, 2000);
      
    } catch (error) {
      console.error('Erreur:', error);
      setSnackbarMessage('Erreur lors de la création de la règle: ' + error.message);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Fade in={!isAnimating} timeout={400}>
            <Box>
              <Stack spacing={4}>
                {/* Nom et Description */}
                <Box>
                  <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                    Informations générales
                  </Typography>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Nom de la règle"
                      placeholder="Ex: Alerte Stock Critique"
                      variant="outlined"
                      value={formData.name}
                      onChange={handleInputChange('name')}
                      error={!!validationErrors.name}
                      helperText={validationErrors.name}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'rgba(255,255,255,0.05)',
                          color: 'white',
                          '& fieldset': {
                            borderColor: 'rgba(255,255,255,0.15)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255,255,255,0.25)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#4285f4',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255,255,255,0.7)',
                        },
                        '& .MuiFormHelperText-root': {
                          color: '#f44336',
                        },
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Description (optionnel)"
                      placeholder="Décrivez le but de cette règle..."
                      variant="outlined"
                      multiline
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange('description')}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'rgba(255,255,255,0.05)',
                          color: 'white',
                          '& fieldset': {
                            borderColor: 'rgba(255,255,255,0.15)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255,255,255,0.25)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#4285f4',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255,255,255,0.7)',
                        },
                      }}
                    />
                  </Stack>
                </Box>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                {/* Module */}
                <Box>
                  <Typography variant="h6" sx={{ color: 'white', mb: 1, fontWeight: 600 }}>
                    Module ERP
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>
                    Sélectionnez le module concerné par cette règle
                  </Typography>
                  <Grid container spacing={2}>
                    {modules.map((module) => (
                      <Grid item xs={12} sm={6} md={4} key={module.value}>
                        <Card
                          onClick={() => {
                            setFormData({ ...formData, module: module.value });
                            if (validationErrors.module) {
                              setValidationErrors({ ...validationErrors, module: undefined });
                            }
                          }}
                          sx={{
                            bgcolor: formData.module === module.value 
                              ? `${module.color}15` 
                              : 'rgba(255,255,255,0.04)',
                            border: formData.module === module.value 
                              ? `2px solid ${module.color}` 
                              : '1px solid rgba(255,255,255,0.1)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            height: '100%',
                            '&:hover': {
                              bgcolor: formData.module === module.value 
                                ? `${module.color}20` 
                                : 'rgba(255,255,255,0.08)',
                              transform: 'translateY(-4px)',
                              boxShadow: formData.module === module.value 
                                ? `0 8px 24px ${module.color}40`
                                : '0 4px 12px rgba(0,0,0,0.2)',
                            },
                          }}
                        >
                          <CardContent sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            py: 2.5,
                          }}>
                            <Box sx={{ 
                              color: formData.module === module.value ? module.color : 'rgba(255,255,255,0.5)',
                              display: 'flex',
                              transition: 'color 0.2s ease',
                            }}>
                              {React.cloneElement(module.icon, { sx: { fontSize: 32 } })}
                            </Box>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                color: 'white', 
                                fontWeight: 600,
                                fontSize: '0.95rem',
                              }}
                            >
                              {module.label}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                  {validationErrors.module && (
                    <Typography variant="caption" sx={{ color: '#f44336', mt: 1.5, display: 'block' }}>
                      {validationErrors.module}
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                {/* Priorité */}
                <Box>
                  <Typography variant="h6" sx={{ color: 'white', mb: 1, fontWeight: 600 }}>
                    Niveau de priorité
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>
                    Définissez l'importance de cette alerte
                  </Typography>
                  <Grid container spacing={2}>
                    {severityOptions.map((severity) => (
                      <Grid item xs={6} sm={3} key={severity.value}>
                        <Card
                          onClick={() => setFormData({ ...formData, severity: severity.value })}
                          sx={{
                            bgcolor: formData.severity === severity.value 
                              ? `${severity.color}15` 
                              : 'rgba(255,255,255,0.04)',
                            border: formData.severity === severity.value 
                              ? `2px solid ${severity.color}` 
                              : '1px solid rgba(255,255,255,0.1)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: `${severity.color}10`,
                              borderColor: severity.color,
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                color: severity.color,
                                fontWeight: 700,
                                fontSize: '0.9rem',
                              }}
                            >
                              {severity.label}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Stack>
            </Box>
          </Fade>
        );

      case 1:
        return (
          <Fade in={!isAnimating} timeout={400}>
            <Box>
              <Stack spacing={4}>
                <Box>
                  <Typography variant="h6" sx={{ color: 'white', mb: 1, fontWeight: 600 }}>
                    Conditions de déclenchement
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>
                    Définissez quand cette règle doit être déclenchée
                  </Typography>
                  
                  {/* Type de condition */}
                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    {conditionTypes.map((type) => (
                      <Grid item xs={12} sm={6} key={type.value}>
                        <Card
                          onClick={() => setFormData({ ...formData, conditionType: type.value })}
                          sx={{
                            bgcolor: formData.conditionType === type.value 
                              ? 'rgba(66,133,244,0.15)' 
                              : 'rgba(255,255,255,0.04)',
                            border: formData.conditionType === type.value 
                              ? '2px solid #4285f4' 
                              : '1px solid rgba(255,255,255,0.1)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            height: '100%',
                            '&:hover': {
                              bgcolor: 'rgba(66,133,244,0.1)',
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
                              <Box sx={{ color: '#4285f4', display: 'flex', alignItems: 'center' }}>
                                {type.icon}
                              </Box>
                              <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                                {type.label}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                              {type.description}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                  
                  {/* Configuration du seuil */}
                  {formData.conditionType === 'threshold' && (
                    <Box sx={{ 
                      p: 3, 
                      bgcolor: 'rgba(255,255,255,0.04)', 
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}>
                      <Typography variant="subtitle1" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                        Configuration du seuil
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>
                              Opérateur
                            </InputLabel>
                            <Select
                              value={formData.comparisonOperator}
                              onChange={handleInputChange('comparisonOperator')}
                              label="Opérateur"
                              sx={{
                                bgcolor: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'rgba(255,255,255,0.15)',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'rgba(255,255,255,0.25)',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#4285f4',
                                },
                              }}
                            >
                              {comparisonOperators.map((operator) => (
                                <MenuItem key={operator.value} value={operator.value}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography sx={{ 
                                      fontFamily: 'monospace', 
                                      fontSize: '1.1rem', 
                                      color: '#4285f4',
                                      fontWeight: 700,
                                    }}>
                                      {operator.symbol}
                                    </Typography>
                                    <Typography>{operator.label}</Typography>
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Valeur du seuil"
                            variant="outlined"
                            type="number"
                            placeholder="Ex: 100"
                            value={formData.thresholdValue}
                            onChange={handleInputChange('thresholdValue')}
                            error={!!validationErrors.thresholdValue}
                            helperText={validationErrors.thresholdValue}
                            required
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                bgcolor: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                '& fieldset': {
                                  borderColor: validationErrors.thresholdValue 
                                    ? '#f44336' 
                                    : 'rgba(255,255,255,0.15)',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'rgba(255,255,255,0.25)',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#4285f4',
                                },
                              },
                              '& .MuiInputLabel-root': {
                                color: 'rgba(255,255,255,0.7)',
                              },
                              '& .MuiFormHelperText-root': {
                                color: '#f44336',
                              },
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {/* Configuration pour absence de données */}
                  {formData.conditionType === 'absence' && (
                    <Box sx={{ 
                      p: 3, 
                      bgcolor: 'rgba(255,255,255,0.04)', 
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}>
                      <Typography variant="subtitle1" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                        Délai avant alerte
                      </Typography>
                      <TextField
                        fullWidth
                        label="Durée sans données (minutes)"
                        variant="outlined"
                        type="number"
                        placeholder="Ex: 30"
                        value={formData.thresholdValue}
                        onChange={handleInputChange('thresholdValue')}
                        error={!!validationErrors.thresholdValue}
                        helperText={validationErrors.thresholdValue}
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(255,255,255,0.05)',
                            color: 'white',
                          },
                        }}
                      />
                    </Box>
                  )}

                  {/* Configuration pour anomalie */}
                  {formData.conditionType === 'anomaly' && (
                    <Box sx={{ 
                      p: 3, 
                      bgcolor: 'rgba(255,255,255,0.04)', 
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}>
                      <Typography variant="subtitle1" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                        Sensibilité de détection
                      </Typography>
                      <TextField
                        fullWidth
                        label="Déviation standard (écarts-types)"
                        variant="outlined"
                        type="number"
                        step="0.1"
                        placeholder="Ex: 2.5"
                        value={formData.thresholdValue}
                        onChange={handleInputChange('thresholdValue')}
                        error={!!validationErrors.thresholdValue}
                        helperText={validationErrors.thresholdValue || "Plus élevé = moins sensible"}
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(255,255,255,0.05)',
                            color: 'white',
                          },
                        }}
                      />
                    </Box>
                  )}

                  {/* Configuration pour tendance */}
                  {formData.conditionType === 'trend' && (
                    <Box sx={{ 
                      p: 3, 
                      bgcolor: 'rgba(255,255,255,0.04)', 
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}>
                      <Typography variant="subtitle1" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                        Pourcentage d'augmentation
                      </Typography>
                      <TextField
                        fullWidth
                        label="% d'augmentation"
                        variant="outlined"
                        type="number"
                        placeholder="Ex: 20"
                        value={formData.thresholdValue}
                        onChange={handleInputChange('thresholdValue')}
                        error={!!validationErrors.thresholdValue}
                        helperText={validationErrors.thresholdValue}
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(255,255,255,0.05)',
                            color: 'white',
                          },
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Stack>
            </Box>
          </Fade>
        );
        
      case 2:
        return (
          <Fade in={!isAnimating} timeout={400}>
            <Box>
              <Stack spacing={4}>
                {/* Canaux de notification */}
                <Box>
                  <Typography variant="h6" sx={{ color: 'white', mb: 1, fontWeight: 600 }}>
                    Canaux de notification
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>
                    Choisissez comment vous souhaitez recevoir les alertes
                  </Typography>
                  <Grid container spacing={2}>
                    {notificationChannels.map((channel) => (
                      <Grid item xs={6} sm={4} md={2} key={channel.value}>
                        <Card
                          onClick={() => handleChannelToggle(channel.value)}
                          sx={{
                            bgcolor: formData.notificationChannels.includes(channel.value)
                              ? `${channel.color}20`
                              : 'rgba(255,255,255,0.04)',
                            border: formData.notificationChannels.includes(channel.value)
                              ? `2px solid ${channel.color}`
                              : '1px solid rgba(255,255,255,0.1)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: formData.notificationChannels.includes(channel.value)
                                ? `${channel.color}30`
                                : 'rgba(255,255,255,0.08)',
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                            <Box sx={{ 
                              color: formData.notificationChannels.includes(channel.value)
                                ? channel.color
                                : 'rgba(255,255,255,0.5)',
                              mb: 1,
                              display: 'flex',
                              justifyContent: 'center',
                            }}>
                              {React.cloneElement(channel.icon, { sx: { fontSize: 28 } })}
                            </Box>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: 'white', 
                                fontWeight: 600,
                                fontSize: '0.8rem',
                              }}
                            >
                              {channel.label}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                  {validationErrors.channels && (
                    <Typography variant="caption" sx={{ color: '#f44336', mt: 1.5, display: 'block' }}>
                      {validationErrors.channels}
                    </Typography>
                  )}
                </Box>
                
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                
                {/* Destinataires */}
                <Box>
                  <Typography variant="h6" sx={{ color: 'white', mb: 1, fontWeight: 600 }}>
                    Destinataires
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>
                    Ajoutez les personnes qui recevront les notifications
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1.5, 
                    mb: 3,
                    flexDirection: { xs: 'column', sm: 'row' },
                  }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="email@example.com ou @username"
                      value={customRecipient}
                      onChange={(e) => setCustomRecipient(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
                      error={!!validationErrors.recipients}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: 'rgba(255,255,255,0.5)' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'rgba(255,255,255,0.05)',
                          color: 'white',
                          '& fieldset': {
                            borderColor: validationErrors.recipients 
                              ? '#f44336' 
                              : 'rgba(255,255,255,0.15)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255,255,255,0.25)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#4285f4',
                          },
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleAddRecipient}
                      startIcon={<AddIcon />}
                      sx={{
                        bgcolor: '#4285f4',
                        color: 'white',
                        minWidth: { xs: '100%', sm: '140px' },
                        height: '56px',
                        fontWeight: 600,
                        '&:hover': {
                          bgcolor: '#357abd',
                        },
                      }}
                    >
                      Ajouter
                    </Button>
                  </Box>
                  
                  {validationErrors.recipients && (
                    <Typography variant="caption" sx={{ color: '#f44336', mb: 2, display: 'block' }}>
                      {validationErrors.recipients}
                    </Typography>
                  )}
                  
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 1.5, 
                    minHeight: 80, 
                    p: 2.5, 
                    bgcolor: 'rgba(0,0,0,0.2)', 
                    borderRadius: 2,
                    border: '1px dashed rgba(255,255,255,0.1)',
                    alignItems: 'flex-start',
                  }}>
                    {formData.recipients.length === 0 ? (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'rgba(255,255,255,0.4)',
                          fontStyle: 'italic',
                          width: '100%',
                          textAlign: 'center',
                          py: 2,
                        }}
                      >
                        Aucun destinataire ajouté
                      </Typography>
                    ) : (
                      formData.recipients.map((recipient) => (
                        <Chip
                          key={recipient}
                          label={recipient}
                          onDelete={() => handleRemoveRecipient(recipient)}
                          deleteIcon={<CloseIcon />}
                          sx={{
                            color: 'white',
                            bgcolor: 'rgba(66,133,244,0.3)',
                            fontWeight: 500,
                            height: 36,
                            '& .MuiChip-deleteIcon': {
                              color: 'rgba(255,255,255,0.7)',
                              '&:hover': {
                                color: '#f44336',
                              },
                            },
                          }}
                        />
                      ))
                    )}
                  </Box>
                </Box>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                {/* Planification */}
                <Box>
                  <Typography variant="h6" sx={{ color: 'white', mb: 1, fontWeight: 600 }}>
                    Fréquence de vérification
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>
                    À quelle fréquence vérifier cette condition
                  </Typography>
                  <Grid container spacing={2}>
                    {scheduleOptions.map((schedule) => (
                      <Grid item xs={12} sm={6} md={4} key={schedule.value}>
                        <Card
                          onClick={() => setFormData({ ...formData, schedule: schedule.value })}
                          sx={{
                            bgcolor: formData.schedule === schedule.value 
                              ? 'rgba(66,133,244,0.15)' 
                              : 'rgba(255,255,255,0.04)',
                            border: formData.schedule === schedule.value 
                              ? '2px solid #4285f4' 
                              : '1px solid rgba(255,255,255,0.1)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            height: '100%',
                            '&:hover': {
                              bgcolor: 'rgba(66,133,244,0.1)',
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          <CardContent sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                              <Box sx={{ color: '#4285f4', display: 'flex' }}>
                                {schedule.icon}
                              </Box>
                              <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                                {schedule.label}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                              {schedule.description}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Stack>
            </Box>
          </Fade>
        );
        
      default:
        return null;
    }
  };

  return (
    <Box sx={{ bgcolor: '#0a0e27', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Paper sx={{ 
          p: 3, 
          mb: 4,
          bgcolor: 'rgba(255,255,255,0.04)',
          borderRadius: 2,
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{ 
                bgcolor: 'linear-gradient(135deg, #4285f4 0%, #357abd 100%)',
                background: 'linear-gradient(135deg, #4285f4 0%, #357abd 100%)',
                borderRadius: 2,
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(66, 133, 244, 0.3)',
              }}>
                <NotificationsIcon sx={{ color: 'white', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>
                  Nouvelle règle d'alerte
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  Configurez une règle pour recevoir des notifications automatiques
                </Typography>
              </Box>
            </Box>
            <Button
              onClick={() => navigate('/regles-alertes')}
              startIcon={<ArrowBackIcon />}
              sx={{ 
                color: 'rgba(255,255,255,0.7)',
                '&:hover': {
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Retour
            </Button>
          </Box>
        </Paper>

        {/* Stepper */}
        <Paper sx={{ 
          p: 4, 
          mb: 4, 
          bgcolor: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 2,
        }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel 
                  sx={{
                    '& .MuiStepLabel-label': {
                      color: activeStep >= index ? 'white' : 'rgba(255,255,255,0.4)',
                      fontWeight: activeStep === index ? 700 : 500,
                      fontSize: '0.95rem',
                      mt: 1,
                    },
                    '& .MuiStepIcon-root': {
                      color: activeStep >= index ? '#4285f4' : 'rgba(255,255,255,0.2)',
                      fontSize: '2rem',
                      '&.Mui-active': {
                        color: '#4285f4',
                      },
                      '&.Mui-completed': {
                        color: '#34A853',
                      },
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Formulaire */}
        <Paper sx={{ 
          p: 5, 
          mb: 4,
          bgcolor: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 2,
          minHeight: 500,
        }}>
          {renderStepContent(activeStep)}
        </Paper>

        {/* Navigation */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: 2,
        }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<ArrowBackIcon />}
            sx={{
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'white',
              },
              '&:disabled': {
                color: 'rgba(255,255,255,0.3)',
              },
            }}
          >
            Retour
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              startIcon={<SaveIcon />}
              sx={{
                bgcolor: '#4285f4',
                color: 'white',
                px: 5,
                py: 1.5,
                fontWeight: 700,
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(66, 133, 244, 0.4)',
                '&:hover': {
                  bgcolor: '#357abd',
                  boxShadow: '0 6px 16px rgba(66, 133, 244, 0.5)',
                },
              }}
            >
              Créer la règle
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ChevronRightIcon />}
              sx={{
                bgcolor: '#4285f4',
                color: 'white',
                px: 5,
                py: 1.5,
                fontWeight: 700,
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(66, 133, 244, 0.4)',
                '&:hover': {
                  bgcolor: '#357abd',
                  boxShadow: '0 6px 16px rgba(66, 133, 244, 0.5)',
                },
              }}
            >
              Suivant
            </Button>
          )}
        </Box>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{ 
            width: '100%',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NewAlert;
