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
  Stepper,
  Step,
  StepLabel,
  Autocomplete,
  Tooltip,
  Fade,
  Slide,
  Stack,
  LinearProgress,
  Badge,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Notifications as NotificationsIcon,
  FlashOn as FlashOnIcon,
  Settings as SettingsIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Webhook as WebhookIcon,
  NotificationsActive as NotificationsActiveIcon,
  HelpOutline as HelpOutlineIcon,
  PlayArrow as PlayArrowIcon,
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
    tags: [],
  });

  const [customRecipient, setCustomRecipient] = useState('');
  const [customTag, setCustomTag] = useState('');

  // Options pour les sélecteurs avec icônes
  const modules = [
    { value: 'finance', label: 'Finance',  color: '#3f51b5' },
    { value: 'rh', label: 'Ressources Humaines', color: '#3f51b5' },
    { value: 'production', label: 'Production', color: '#3f51b5' },
    { value: 'sales', label: 'Ventes',  color: '#3f51b5' },
    { value: 'purchasing', label: 'Achats',  color: '#3f51b5' },
    { value: 'accounting', label: 'Comptabilité',  color: '#3f51b5' },
  ];

  const severityOptions = [
    { 
      value: 'low', 
      label: 'Faible',  
      color: '#3F1AD3',
      bgColor: 'rgba(33, 150, 243, 0.1)',
      description: 'Notification informative'
    },
    { 
      value: 'medium', 
      label: 'Moyenne',  
      color: '#3F1AD3',
       bgColor: 'rgba(33, 150, 243, 0.1)',
      description: 'Attention requise'
    },
    { 
      value: 'high', 
      label: 'Haute', 
      color: '#3F1AD3',
       bgColor: 'rgba(33, 150, 243, 0.1)',
      description: 'Action urgente nécessaire'
    },
     { 
      value: 'critical', 
      label: 'Critique', 
      color: '#3F1AD3',
      bgColor: 'rgba(33, 150, 243, 0.1)',
      description: 'Action critique immédiate requise'
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
    { value: 'between', label: 'Entre', symbol: '⟷' },
    { value: 'greater_equal', label: 'Supérieur ou égal à', symbol: '≥' },
    { value: 'less_equal', label: 'Inférieur ou égal à', symbol: '≤' },
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
    { value: 'custom', label: 'Personnalisé', icon: <SettingsIcon />, description: 'Expression CRON' },
  ];

  const steps = [
    { label: 'Configuration', icon: <SettingsIcon /> },
    { label: 'Conditions & Notifications', icon: <NotificationsIcon /> },
    { label: 'Planification & Révision', icon: <ScheduleIcon /> },
  ];

  // Validation
  const validateStep = (step) => {
    const errors = {};
    
    if (step === 0) {
      if (!formData.name.trim()) errors.name = 'Le nom est requis';
      if (!formData.module) errors.module = 'Le module est requis';
    }
    
    if (step === 1) {
      if (formData.conditionType === 'threshold' && !formData.thresholdValue) {
        errors.thresholdValue = 'La valeur du seuil est requise';
      }
      if (formData.notificationChannels.length === 0) {
        errors.channels = 'Au moins un canal de notification est requis';
      }
      if (formData.recipients.length === 0) {
        errors.recipients = 'Au moins un destinataire est requis';
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
    // Clear validation error for this field
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
  };

  const handleAddRecipient = () => {
    if (customRecipient && !formData.recipients.includes(customRecipient)) {
      // Validation basique d'email
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

  const handleAddTag = () => {
    if (customTag && !formData.tags.includes(customTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, customTag],
      });
      setCustomTag('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    });
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveStep((prevStep) => prevStep + 1);
        setIsAnimating(false);
      }, 300);
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
    }, 300);
  };

 const handleSubmit = async () => {
  if (!validateStep(activeStep)) {
    setSnackbarMessage('Veuillez vérifier tous les champs');
    setSnackbarSeverity('error');
    setOpenSnackbar(true);
    return;
  }

  try {
    // Récupérer l'ID de l'utilisateur
    const userId = user?.id || 'guest';
    const storageKey = `alerts_${userId}`;
    
    // Récupérer les alertes existantes pour cet utilisateur
    const existingAlerts = localStorage.getItem(storageKey);
    const alerts = existingAlerts ? JSON.parse(existingAlerts) : [];
    
    // Créer la nouvelle alerte avec un ID unique
    const newAlert = {
      id: Date.now().toString(), // ID unique basé sur le timestamp
      ...formData,
      createdAt: new Date().toISOString(),
      createdBy: userId,
    };
    
    // Ajouter la nouvelle alerte
    alerts.push(newAlert);
    
    // Sauvegarder dans localStorage avec la clé spécifique à l'utilisateur
    localStorage.setItem(storageKey, JSON.stringify(alerts));
    
    console.log('Alerte créée:', newAlert);
    console.log('Toutes les alertes pour', userId, ':', alerts);
    
    setSnackbarMessage('Règle d\'alerte créée avec succès !');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
    
    // Rediriger vers la page des alertes de l'utilisateur APRÈS 2 secondes
    setTimeout(() => {
      navigate('/alerts'); // Note: c'est '/alerts' en minuscules
    }, 2000);
    
  } catch (error) {
    console.error('Erreur:', error);
    setSnackbarMessage('Erreur lors de la création de la règle');
    setSnackbarSeverity('error');
    setOpenSnackbar(true);
  }
};
   

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const getCompletionPercentage = () => {
    let completed = 0;
    let total = 8;
    
    if (formData.name) completed++;
    if (formData.module) completed++;
    if (formData.severity) completed++;
    if (formData.conditionType) completed++;
    if (formData.thresholdValue) completed++;
    if (formData.notificationChannels.length > 0) completed++;
    if (formData.recipients.length > 0) completed++;
    if (formData.schedule) completed++;
    
    return (completed / total) * 100;
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
  return (
    <Fade in={!isAnimating} timeout={500}>
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          
          {/* Nom de la règle - Pleine largeur */}
          <Grid item xs={12}>
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
          </Grid>

          {/* Module ERP avec cartes */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              Module ERP 
              <Tooltip title="Sélectionnez le module à surveiller">
                <HelpOutlineIcon sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 20 }} />
              </Tooltip>
            </Typography>
            <Grid container spacing={2}>
              {modules.map((module) => (
                <Grid item xs={6} sm={4} md={3} key={module.value}>
                  <Card
                    onClick={() => {
                      setFormData({ ...formData, module: module.value });
                      if (validationErrors.module) {
                        setValidationErrors({ ...validationErrors, module: undefined });
                      }
                    }}
                    sx={{
                      bgcolor: formData.module === module.value 
                        ? `${module.color}20` 
                        : 'rgba(255,255,255,0.03)',
                      border: formData.module === module.value 
                        ? `2px solid ${module.color}` 
                        : validationErrors.module
                        ? '2px solid #f44336'
                        : '2px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: formData.module === module.value 
                          ? `${module.color}30` 
                          : 'rgba(255,255,255,0.05)',
                        transform: 'translateY(-4px)',
                        boxShadow: `0 4px 12px ${module.color}40`,
                      },
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h4" sx={{ mb: 1 }}>
                        {module.icon}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                        {module.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {validationErrors.module && (
              <Typography variant="caption" sx={{ color: '#f44336', mt: 1, display: 'block' }}>
                {validationErrors.module}
              </Typography>
            )}
          </Grid>
          
          {/* Niveau de sévérité avec cartes */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              Niveau de sévérité
              <Tooltip title="Définit l'importance de l'alerte">
                <HelpOutlineIcon sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 20 }} />
              </Tooltip>
            </Typography>
            <Grid container spacing={2}>
              {severityOptions.map((severity) => (
                <Grid item xs={12} sm={6} md={3} key={severity.value}>
                  <Card
                    onClick={() => setFormData({ ...formData, severity: severity.value })}
                    sx={{
                      bgcolor: formData.severity === severity.value 
                        ? severity.bgColor 
                        : 'rgba(255,255,255,0.03)',
                      border: formData.severity === severity.value 
                        ? `2px solid ${severity.color}` 
                        : '2px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: formData.severity === severity.value 
                          ? severity.bgColor 
                          : 'rgba(255,255,255,0.05)',
                        transform: 'translateY(-4px)',
                        boxShadow: `0 4px 12px ${severity.color}40`,
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Box sx={{ color: severity.color }}>
                          {severity.icon}
                        </Box>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                          {severity.label}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        {severity.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Description - Pleine largeur */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              Description
            </Typography>
            <TextField
              fullWidth
              label="Description"
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
                    borderColor: 'rgba(255,255,255,0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.2)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4285f4',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.7)',
                },
                '& .MuiFormHelperText-root': {
                  color: 'rgba(255,255,255,0.5)',
                },
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
      case 1:
        return (
          <Fade in={!isAnimating} timeout={500}>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={4}>
                {/* Section Conditions */}
                <Grid item xs={12}>
                  <Card sx={{ 
                    bgcolor: 'rgba(66,133,244,0.05)', 
                    border: '1px solid rgba(66,133,244,0.2)',
                    borderRadius: 2,
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SpeedIcon sx={{ color: '#4285f4' }} />
                        Conditions de déclenchement
                      </Typography>
                      
                      <Grid container spacing={3}>
                        {/* Type de condition avec cartes */}
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                            Type de condition
                          </Typography>
                          <Grid container spacing={2}>
                            {conditionTypes.map((type) => (
                              <Grid item xs={12} sm={6} key={type.value}>
                                <Card
                                  onClick={() => setFormData({ ...formData, conditionType: type.value })}
                                  sx={{
                                    bgcolor: formData.conditionType === type.value 
                                      ? 'rgba(66,133,244,0.2)' 
                                      : 'rgba(255,255,255,0.03)',
                                    border: formData.conditionType === type.value 
                                      ? '2px solid #4285f4' 
                                      : '2px solid rgba(255,255,255,0.1)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      bgcolor: 'rgba(66,133,244,0.1)',
                                      transform: 'translateY(-2px)',
                                    },
                                  }}
                                >
                                  <CardContent sx={{ py: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                      <Box sx={{ color: '#4285f4' }}>
                                        {type.icon}
                                      </Box>
                                      <Box sx={{ flex: 1 }}>
                                        <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                                          {type.label}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                          {type.description}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </Grid>
                        
                        {formData.conditionType === 'threshold' && (
                          <>
                            <Grid item xs={12} md={6}>
                              <FormControl fullWidth>
                                <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Opérateur de comparaison</InputLabel>
                                <Select
                                  value={formData.comparisonOperator}
                                  onChange={handleInputChange('comparisonOperator')}
                                  label="Opérateur de comparaison"
                                  sx={{
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: 'rgba(255,255,255,0.1)',
                                    },
                                  }}
                                >
                                  {comparisonOperators.map((operator) => (
                                    <MenuItem key={operator.value} value={operator.value}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography sx={{ fontFamily: 'monospace', fontSize: '1.2rem', color: '#4285f4' }}>
                                          {operator.symbol}
                                        </Typography>
                                        {operator.label}
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
                                      borderColor: validationErrors.thresholdValue ? '#f44336' : 'rgba(255,255,255,0.1)',
                                    },
                                  },
                                  '& .MuiInputLabel-root': {
                                    color: 'rgba(255,255,255,0.7)',
                                  },
                                }}
                              />
                            </Grid>
                          </>
                        )}
                        
                        {/* Aperçu de la condition */}
                        <Grid item xs={12}>
                          <Card sx={{ 
                            bgcolor: 'rgba(0,0,0,0.3)', 
                            border: '1px solid rgba(66,133,244,0.3)',
                            borderLeft: '4px solid #4285f4',
                          }}>
                            <CardContent>
                              <Typography variant="subtitle2" sx={{ color: '#4285f4', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircleIcon fontSize="small" />
                                Aperçu de la règle
                              </Typography>
                              <Typography sx={{ 
                                color: 'rgba(255,255,255,0.9)', 
                                fontFamily: 'monospace', 
                                fontSize: '0.95rem',
                                lineHeight: 1.8,
                              }}>
                                <span style={{ color: '#ff9800' }}>SI</span>{' '}
                                <span style={{ color: '#4caf50' }}>
                                  {modules.find(m => m.value === formData.module)?.label || '[MODULE]'}
                                </span>
                                .
                                <span style={{ color: '#2196f3' }}>
                                  {conditionTypes.find(c => c.value === formData.conditionType)?.label || '[CONDITION]'}
                                </span>
                                {' '}
                                <span style={{ color: '#9c27b0' }}>
                                  {comparisonOperators.find(o => o.value === formData.comparisonOperator)?.symbol || ''}
                                </span>
                                {' '}
                                <span style={{ color: '#ff5722' }}>
                                  {formData.thresholdValue || '[VALEUR]'}
                                </span>
                                <br />
                                <span style={{ color: '#ff9800' }}>ALORS</span>{' '}
                                <span style={{ color: 'white' }}>déclencher l'alerte</span>
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Section Notifications */}
                <Grid item xs={12}>
                  <Card sx={{ 
                    bgcolor: 'rgba(76,175,80,0.05)', 
                    border: '1px solid rgba(76,175,80,0.2)',
                    borderRadius: 2,
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <NotificationsActiveIcon sx={{ color: '#4caf50' }} />
                        Configuration des notifications
                      </Typography>
                      
                      <Grid container spacing={3}>
                        {/* Canaux de notification */}
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                            Canaux de notification *
                          </Typography>
                          <Grid container spacing={2}>
                            {notificationChannels.map((channel) => (
                              <Grid item xs={6} sm={4} md={2} key={channel.value}>
                                <Card
                                  onClick={() => handleChannelToggle(channel.value)}
                                  sx={{
                                    bgcolor: formData.notificationChannels.includes(channel.value)
                                      ? `${channel.color}20`
                                      : 'rgba(255,255,255,0.03)',
                                    border: formData.notificationChannels.includes(channel.value)
                                      ? `2px solid ${channel.color}`
                                      : '2px solid rgba(255,255,255,0.1)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      bgcolor: formData.notificationChannels.includes(channel.value)
                                        ? `${channel.color}30`
                                        : 'rgba(255,255,255,0.05)',
                                      transform: 'scale(1.05)',
                                    },
                                  }}
                                >
                                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                    <Box sx={{ color: channel.color, mb: 1 }}>
                                      {channel.icon}
                                    </Box>
                                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 500 }}>
                                      {channel.label}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                          {validationErrors.channels && (
                            <Typography variant="caption" sx={{ color: '#f44336', mt: 1, display: 'block' }}>
                              {validationErrors.channels}
                            </Typography>
                          )}
                        </Grid>
                        
                        {/* Destinataires */}
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                            Destinataires *
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <TextField
                              fullWidth
                              variant="outlined"
                              placeholder="email@example.com ou @username"
                              value={customRecipient}
                              onChange={(e) => setCustomRecipient(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
                              error={!!validationErrors.recipients}
                              helperText={validationErrors.recipients}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  bgcolor: 'rgba(255,255,255,0.05)',
                                  color: 'white',
                                  '& fieldset': {
                                    borderColor: validationErrors.recipients ? '#f44336' : 'rgba(255,255,255,0.1)',
                                  },
                                },
                              }}
                            />
                            <Button
                              variant="contained"
                              onClick={handleAddRecipient}
                              startIcon={<AddIcon />}
                              sx={{
                                bgcolor: '#4caf50',
                                color: 'white',
                                minWidth: '120px',
                                '&:hover': {
                                  bgcolor: '#45a049',
                                },
                              }}
                            >
                              Ajouter
                            </Button>
                          </Box>
                          
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, minHeight: 60, p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
                            {formData.recipients.length === 0 ? (
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                                Aucun destinataire ajouté
                              </Typography>
                            ) : (
                              formData.recipients.map((recipient) => (
                                <Chip
                                  key={recipient}
                                  label={recipient}
                                  onDelete={() => handleRemoveRecipient(recipient)}
                                  deleteIcon={<DeleteIcon />}
                                  sx={{
                                    color: 'white',
                                    bgcolor: 'rgba(76,175,80,0.3)',
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
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );
        
      case 2:
        return (
          <Fade in={!isAnimating} timeout={500}>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={4}>
                {/* Section Planification */}
                <Grid item xs={12}>
                  <Card sx={{ 
                    bgcolor: 'rgba(255,152,0,0.05)', 
                    border: '1px solid rgba(255,152,0,0.2)',
                    borderRadius: 2,
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ScheduleIcon sx={{ color: '#ff9800' }} />
                        Planification et fréquence
                      </Typography>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                            Fréquence d'exécution
                          </Typography>
                          <Grid container spacing={2}>
                            {scheduleOptions.map((schedule) => (
                              <Grid item xs={12} sm={6} md={4} key={schedule.value}>
                                <Card
                                  onClick={() => setFormData({ ...formData, schedule: schedule.value })}
                                  sx={{
                                    bgcolor: formData.schedule === schedule.value 
                                      ? 'rgba(255,152,0,0.2)' 
                                      : 'rgba(255,255,255,0.03)',
                                    border: formData.schedule === schedule.value 
                                      ? '2px solid #ff9800' 
                                      : '2px solid rgba(255,255,255,0.1)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      bgcolor: 'rgba(255,152,0,0.1)',
                                      transform: 'translateY(-2px)',
                                    },
                                  }}
                                >
                                  <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                      <Box sx={{ color: '#ff9800' }}>
                                        {schedule.icon}
                                      </Box>
                                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                                        {schedule.label}
                                      </Typography>
                                    </Box>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                      {schedule.description}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </Grid>
                        
                        {formData.schedule === 'custom' && (
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Expression CRON"
                              variant="outlined"
                              value={formData.customSchedule}
                              onChange={handleInputChange('customSchedule')}
                              placeholder="0 9 * * * (Chaque jour à 9h00)"
                              helperText="Format: minute heure jour mois jour-semaine"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  bgcolor: 'rgba(255,255,255,0.05)',
                                  color: 'white',
                                  fontFamily: 'monospace',
                                  '& fieldset': {
                                    borderColor: 'rgba(255,255,255,0.1)',
                                  },
                                },
                                '& .MuiInputLabel-root': {
                                  color: 'rgba(255,255,255,0.7)',
                                },
                                '& .MuiFormHelperText-root': {
                                  color: 'rgba(255,255,255,0.5)',
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
                                    color: '#4caf50',
                                  },
                                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    bgcolor: '#4caf50',
                                  },
                                }}
                              />
                            }
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography sx={{ color: 'white', fontWeight: 500 }}>
                                  Activer cette règle immédiatement
                                </Typography>
                                {formData.isActive && (
                                  <Chip 
                                    label="Active" 
                                    size="small" 
                                    sx={{ 
                                      bgcolor: '#4caf50',
                                      color: 'white',
                                      fontWeight: 600,
                                    }} 
                                  />
                                )}
                              </Box>
                            }
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Récapitulatif complet */}
                <Grid item xs={12}>
                  <Card sx={{ 
                    bgcolor: 'rgba(156,39,176,0.05)', 
                    border: '1px solid rgba(156,39,176,0.2)',
                    borderRadius: 2,
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon sx={{ color: '#9c27b0' }} />
                        Récapitulatif de la règle
                      </Typography>
                      
                      <Grid container spacing={3}>
                            
                        <Grid item xs={12} md={6}>
                        
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                              NOM DE LA RÈGLE
                            </Typography>
                            <Typography variant="h6" sx={{ color: 'white', mt: 0.5 }}>
                              {formData.name || 'Non défini'}
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                              MODULE
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Typography variant="h6">
                                {modules.find(m => m.value === formData.module)?.icon}
                              </Typography>
                              <Typography variant="h6" sx={{ color: 'white' }}>
                                {modules.find(m => m.value === formData.module)?.label || 'Non défini'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                              SÉVÉRITÉ
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              {severityOptions.find(s => s.value === formData.severity)?.icon}
                              <Typography variant="body1" sx={{ 
                                color: severityOptions.find(s => s.value === formData.severity)?.color,
                                fontWeight: 600,
                              }}>
                                {severityOptions.find(s => s.value === formData.severity)?.label}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                              TYPE DE CONDITION
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'white', mt: 0.5 }}>
                              {conditionTypes.find(c => c.value === formData.conditionType)?.label || 'Non défini'}
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                              CANAUX DE NOTIFICATION
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                              {formData.notificationChannels.map(channel => {
                                const channelInfo = notificationChannels.find(c => c.value === channel);
                                return (
                                  <Chip
                                    key={channel}
                                    icon={channelInfo?.icon}
                                    label={channelInfo?.label}
                                    size="small"
                                    sx={{
                                      bgcolor: `${channelInfo?.color}30`,
                                      color: 'white',
                                      '& .MuiChip-icon': {
                                        color: channelInfo?.color,
                                      },
                                    }}
                                  />
                                );
                              })}
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                              DESTINATAIRES
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'white', mt: 0.5 }}>
                              {formData.recipients.length} destinataire(s)
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                              FRÉQUENCE
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'white', mt: 0.5 }}>
                              {scheduleOptions.find(s => s.value === formData.schedule)?.label || 'Non défini'}
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                              STATUT
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                              <Chip
                                label={formData.isActive ? 'Active' : 'Inactive'}
                                size="small"
                                sx={{
                                  bgcolor: formData.isActive ? '#4caf50' : 'rgba(255,255,255,0.1)',
                                  color: 'white',
                                  fontWeight: 600,
                                }}
                              />
                            </Box>
                          </Box>
                        </Grid>

                        {formData.description && (
                          <Grid item xs={12}>
                            <Divider sx={{ my: 1, bgcolor: 'rgba(255,255,255,0.1)' }} />
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                DESCRIPTION
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
                                {formData.description}
                              </Typography>
                            </Box>
                          </Grid>
                        )}

                        {formData.tags.length > 0 && (
                          <Grid item xs={12}>
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                TAGS
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                {formData.tags.map(tag => (
                                  <Chip
                                    key={tag}
                                    label={tag}
                                    size="small"
                                    sx={{
                                      bgcolor: 'rgba(66,133,244,0.2)',
                                      color: 'white',
                                    }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );
        
      default:
        return null;
    }
  };

  return (
    <Box sx={{ bgcolor: '#0a0e27', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="lg">
        {/* Header avec gradient */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 4,
          p: 3,
          background: 'linear-gradient(135deg, rgba(66,133,244,0.1) 0%, rgba(156,39,176,0.1) 100%)',
          borderRadius: 2,
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <IconButton
            onClick={() => navigate('/regles-alertes')}
            sx={{ 
              color: 'white', 
              mr: 2,
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
              Créer une nouvelle règle d'alerte
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Configurez une règle de surveillance personnalisée pour votre système ERP
            </Typography>
          </Box>
       
        </Box>

       

        {/* Stepper amélioré */}
        <Paper sx={{ 
          p: 3, 
          mb: 4, 
          bgcolor: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel 
                  icon={
                    <Box sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: activeStep >= index ? '#4285f4' : 'rgba(255,255,255,0.1)',
                      color: 'white',
                      transition: 'all 0.3s ease',
                    }}>
                      {activeStep > index ? <CheckCircleIcon /> : step.icon}
                    </Box>
                  }
                  sx={{
                    '& .MuiStepLabel-label': {
                      color: 'rgba(255,255,255,0.6)',
                      fontWeight: 500,
                    },
                    '& .MuiStepLabel-label.Mui-active': {
                      color: 'white',
                      fontWeight: 600,
                    },
                    '& .MuiStepLabel-label.Mui-completed': {
                      color: '#4285f4',
                      fontWeight: 600,
                    },
                  }}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Formulaire */}
        <Paper sx={{ 
          p: 4, 
          mb: 4,
          bgcolor: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          minHeight: 500,
        }}>
          {renderStepContent(activeStep)}
        </Paper>

        {/* Boutons de navigation améliorés */}
        <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
         
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              Étape {activeStep + 1} sur {steps.length}
            </Typography>
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                startIcon={<SaveIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(40,167,69,0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #218838 0%, #1aa179 100%)',
                    boxShadow: '0 6px 16px rgba(40,167,69,0.6)',
                  },
                }}
              >
                Créer la règle
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />}
                sx={{
                  background: 'linear-gradient(135deg, #4285f4 0%, #4285f4 100%)',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(66,133,244,0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #357abd 0%, #4285f4 100%)',
                    boxShadow: '0 6px 16px rgba(66,133,244,0.6)',
                  },
                }}
              >
                Suivant
              </Button>
            )}
          </Box>
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
          severity={snackbarSeverity}
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