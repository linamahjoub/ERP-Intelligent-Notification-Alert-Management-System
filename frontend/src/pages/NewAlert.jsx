import React, { useState } from 'react';
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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NewAlert = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

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
    { value: 'finance', label: 'Finance' },
    { value: 'rh', label: 'Ressources Humaines' },
    { value: 'logistics', label: 'Logistique' },
    { value: 'production', label: 'Production' },
    { value: 'sales', label: 'Ventes' },
    { value: 'inventory', label: 'Inventaire' },
    { value: 'purchasing', label: 'Achats' },
    { value: 'accounting', label: 'Comptabilité' },
  ];

  const severityOptions = [
    { value: 'low', label: 'Faible', icon: <InfoIcon />, color: '#2196f3' },
    { value: 'medium', label: 'Moyenne', icon: <WarningIcon />, color: '#ff9800' },
    { value: 'high', label: 'Haute', icon: <ErrorIcon />, color: '#f44336' },
    { value: 'critical', label: 'Critique', icon: <FlashOnIcon />, color: '#9c27b0' },
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
    { value: 'slack', label: 'Slack' },
    { value: 'teams', label: 'Microsoft Teams' },
    { value: 'webhook', label: 'Webhook' },
    { value: 'sms', label: 'SMS' },
    { value: 'push', label: 'Notification Push' },
  ];

  const scheduleOptions = [
    { value: 'immediate', label: 'Immédiat' },
    { value: 'hourly', label: 'Toutes les heures' },
    { value: 'daily', label: 'Quotidien' },
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'monthly', label: 'Mensuel' },
    { value: 'custom', label: 'Personnalisé' },
  ];

  const steps = ['Configuration', 'Condition', 'Notification', 'Planification'];

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

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    try {
      // Simuler l'envoi des données
      console.log('Données à envoyer:', formData);
      
      // Ici, vous enverriez les données à votre API
      // const response = await api.post('/alerts', formData);
      
      setSnackbarMessage('Règle d\'alerte créée avec succès !');
      setOpenSnackbar(true);
      
      // Rediriger après 2 secondes
      setTimeout(() => {
        navigate('/regles-alertes');
      }, 2000);
      
    } catch (error) {
      setSnackbarMessage('Erreur lors de la création de la règle');
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
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white', mb: 3 }}>
              Configuration de base
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom de la règle"
                  variant="outlined"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  required
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
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.7)',
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
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
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.7)',
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Module ERP</InputLabel>
                  <Select
                    value={formData.module}
                    onChange={handleInputChange('module')}
                    label="Module ERP"
                    required
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.1)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.2)',
                      },
                    }}
                  >
                    {modules.map((module) => (
                      <MenuItem key={module.value} value={module.value}>
                        {module.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Sévérité</InputLabel>
                  <Select
                    value={formData.severity}
                    onChange={handleInputChange('severity')}
                    label="Sévérité"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    {severityOptions.map((severity) => (
                      <MenuItem key={severity.value} value={severity.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ color: severity.color }}>
                            {severity.icon}
                          </Box>
                          {severity.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );
        
      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white', mb: 3 }}>
              Condition de déclenchement
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Type de condition</InputLabel>
                  <Select
                    value={formData.conditionType}
                    onChange={handleInputChange('conditionType')}
                    label="Type de condition"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.1)',
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
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Opérateur</InputLabel>
                  <Select
                    value={formData.comparisonOperator}
                    onChange={handleInputChange('comparisonOperator')}
                    label="Opérateur"
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
                        {operator.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Valeur du seuil"
                  variant="outlined"
                  type="number"
                  value={formData.thresholdValue}
                  onChange={handleInputChange('thresholdValue')}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255,255,255,0.1)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.7)',
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
                      Aperçu de la condition
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
                      SI {formData.module.toUpperCase() || '[module]'}.{formData.conditionType || '[métrique]'} {formData.comparisonOperator === 'greater_than' ? '>' : formData.comparisonOperator === 'less_than' ? '<' : '='} {formData.thresholdValue || '[valeur]'}
                      <br />
                      ALORS déclencher l'alerte
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
        
      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white', mb: 3 }}>
              Configuration des notifications
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
                  Canaux de notification
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {notificationChannels.map((channel) => (
                    <Chip
                      key={channel.value}
                      label={channel.label}
                      clickable
                      color={formData.notificationChannels.includes(channel.value) ? 'primary' : 'default'}
                      onClick={() => handleChannelToggle(channel.value)}
                      sx={{
                        color: formData.notificationChannels.includes(channel.value) ? 'white' : 'rgba(255,255,255,0.7)',
                        bgcolor: formData.notificationChannels.includes(channel.value) ? '#4285f4' : 'rgba(255,255,255,0.1)',
                      }}
                    />
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
                  Destinataires
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Ajouter un email ou identifiant"
                      value={customRecipient}
                      onChange={(e) => setCustomRecipient(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'rgba(255,255,255,0.05)',
                          color: 'white',
                          '& fieldset': {
                            borderColor: 'rgba(255,255,255,0.1)',
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
                        '&:hover': {
                          bgcolor: '#357abd',
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
                          bgcolor: 'rgba(66,133,244,0.3)',
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      color="primary"
                    />
                  }
                  label={
                    <Typography sx={{ color: 'white' }}>
                      Activer cette règle immédiatement
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
          </Box>
        );
        
      case 3:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white', mb: 3 }}>
              Planification et fréquence
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Fréquence d'exécution</InputLabel>
                  <Select
                    value={formData.schedule}
                    onChange={handleInputChange('schedule')}
                    label="Fréquence d'exécution"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    {scheduleOptions.map((schedule) => (
                      <MenuItem key={schedule.value} value={schedule.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ScheduleIcon fontSize="small" />
                          {schedule.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {formData.schedule === 'custom' && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Expression CRON (ex: 0 9 * * *)"
                    variant="outlined"
                    value={formData.customSchedule}
                    onChange={handleInputChange('customSchedule')}
                    placeholder="0 9 * * *"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'rgba(255,255,255,0.05)',
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255,255,255,0.1)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255,255,255,0.7)',
                      },
                    }}
                  />
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Card sx={{ bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ color: 'white', mb: 1 }}>
                      Récapitulatif
                    </Typography>
                    <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          Nom de la règle:
                        </Typography>
                        <Typography sx={{ color: 'white' }}>{formData.name || 'Non défini'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          Module:
                        </Typography>
                        <Typography sx={{ color: 'white' }}>
                          {modules.find(m => m.value === formData.module)?.label || 'Non défini'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          Sévérité:
                        </Typography>
                        <Typography sx={{ color: 'white' }}>
                          {severityOptions.find(s => s.value === formData.severity)?.label || 'Non défini'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          Canaux:
                        </Typography>
                        <Typography sx={{ color: 'white' }}>
                          {formData.notificationChannels.length} sélectionné(s)
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
        
      default:
        return null;
    }
  };

  return (
    <Box sx={{ bgcolor: '#0a0e27', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton
            onClick={() => navigate('/regles-alertes')}
            sx={{ color: 'white', mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
              Créer une nouvelle alerte
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Configurez une nouvelle règle de surveillance
            </Typography>
          </Box>
        </Box>

        {/* Stepper */}
        <Paper sx={{ 
          p: 3, 
          mb: 4, 
          bgcolor: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 2,
        }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel sx={{
                  '& .MuiStepLabel-label': {
                    color: 'rgba(255,255,255,0.7)',
                  },
                  '& .MuiStepLabel-label.Mui-active': {
                    color: 'white',
                  },
                  '& .MuiStepLabel-label.Mui-completed': {
                    color: '#4285f4',
                  },
                }}>
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Formulaire */}
        <Paper sx={{ 
          p: 4, 
          mb: 4,
          bgcolor: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 2,
        }}>
          {renderStepContent(activeStep)}
        </Paper>

        {/* Boutons de navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={activeStep === 0 ? () => navigate('/regles-alertes') : handleBack}
            startIcon={activeStep === 0 ? <CancelIcon /> : <ArrowBackIcon />}
            sx={{
              color: 'rgba(255,255,255,0.7)',
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.5)',
              },
            }}
          >
            {activeStep === 0 ? 'Annuler' : 'Retour'}
          </Button>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                startIcon={<SaveIcon />}
                sx={{
                  bgcolor: '#28a745',
                  color: 'white',
                  px: 4,
                  '&:hover': {
                    bgcolor: '#218838',
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
                  bgcolor: '#4285f4',
                  color: 'white',
                  px: 4,
                  '&:hover': {
                    bgcolor: '#357abd',
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
          severity="success" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NewAlert;