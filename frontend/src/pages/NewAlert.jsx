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
  Fade,
  Stack,
  Divider,
  InputAdornment,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Email as EmailIcon,
  NotificationsActive as NotificationsActiveIcon,
  PlayArrow as PlayArrowIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Build as BuildIcon,
  Factory as FactoryIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  Close as CloseIcon,
  ChevronRight as ChevronRightIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ─── Design tokens ──────────────────────────────────────────── */
const T = {
  bg: '#07090f',
  surface: '#0d1117',
  surfaceAlt: '#111827',
  border: 'rgba(255,255,255,0.07)',
  borderHover: 'rgba(255,255,255,0.14)',
  accent: '#3b82f6',
  accentDark: '#2563eb',
  accentGlow: 'rgba(59,130,246,0.25)',
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: 'rgba(148,163,184,0.5)',
};

/* ─── Shared field sx ────────────────────────────────────────── */
const fieldSx = (error = false) => ({
  '& .MuiOutlinedInput-root': {
    bgcolor: T.surfaceAlt,
    color: T.textPrimary,
    borderRadius: 1.5,
    '& fieldset': { borderColor: error ? T.error : T.border },
    '&:hover fieldset': { borderColor: error ? T.error : T.borderHover },
    '&.Mui-focused fieldset': { borderColor: T.accent, borderWidth: 1.5 },
  },
  '& .MuiInputLabel-root': { color: T.textSecondary, fontSize: '0.875rem' },
  '& .MuiFormHelperText-root': { color: T.error, mt: 0.75 },
  '& input': { color: T.textPrimary },
  '& textarea': { color: T.textPrimary },
});

const selectSx = {
  bgcolor: T.surfaceAlt,
  color: T.textPrimary,
  borderRadius: 1.5,
  '& .MuiOutlinedInput-notchedOutline': { borderColor: T.border },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: T.borderHover },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: T.accent, borderWidth: 1.5 },
  '& .MuiSvgIcon-root': { color: T.textSecondary },
};

/* ─── Selectable Card ────────────────────────────────────────── */
const SelectCard = ({ selected, accentColor = T.accent, onClick, children, compact = false, disabled = false }) => (
  <Card
    onClick={disabled ? undefined : onClick}
    sx={{
      bgcolor: selected ? `${accentColor}12` : T.surfaceAlt,
      border: selected ? `1.5px solid ${accentColor}` : `1px solid ${T.border}`,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.18s ease',
      height: '100%',
      borderRadius: 2,
      position: 'relative',
      overflow: 'visible',
      opacity: disabled ? 0.5 : 1,
      '&:hover': {
        bgcolor: disabled ? undefined : selected ? `${accentColor}18` : 'rgba(255,255,255,0.05)',
        borderColor: disabled ? undefined : selected ? accentColor : T.borderHover,
        transform: disabled ? undefined : 'translateY(-2px)',
        boxShadow: disabled ? undefined : selected ? `0 8px 24px ${accentColor}30` : '0 4px 16px rgba(0,0,0,0.3)',
      },
    }}
  >
    {selected && (
      <Box sx={{
        position: 'absolute',
        top: -8,
        right: -8,
        bgcolor: accentColor,
        borderRadius: '50%',
        width: 20,
        height: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 2px 8px ${accentColor}60`,
      }}>
        <CheckCircleIcon sx={{ fontSize: 14, color: 'white' }} />
      </Box>
    )}
    <CardContent sx={{ p: compact ? 2 : 2.5, '&:last-child': { pb: compact ? 2 : 2.5 } }}>
      {children}
    </CardContent>
  </Card>
);

/* ─── Section Header ─────────────────────────────────────────── */
const SectionHeader = ({ title, subtitle }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="subtitle1" sx={{ color: T.textPrimary, fontWeight: 600, fontSize: '0.9375rem', letterSpacing: '-0.01em' }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="body2" sx={{ color: T.textSecondary, mt: 0.5, fontSize: '0.8125rem' }}>
        {subtitle}
      </Typography>
    )}
  </Box>
);

/* ─── Main Component ─────────────────────────────────────────── */
const NewAlert = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [validationErrors, setValidationErrors] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [customRecipient, setCustomRecipient] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    module: '',
    severity: 'medium',
    conditionType: 'threshold',
    thresholdValue: '',
    comparisonOperator: 'greater_than',
    conditionField: 'quantity',
    compareTo: 'value',
    product: '',
    categories: [],
    notificationChannels: ['email'],
    recipients: [],
    schedule: 'immediate',
    customSchedule: '',
    isActive: true,
    repeatUntilResolved: false,
    tags: [],
  });

  const roleToModule = {
    responsable_stock: 'stock',
    commercial: 'crm',
    achats: 'facturation',
  };

  const lockedModule = roleToModule[user?.role] || '';

  useEffect(() => {
    if (!user?.role || formData.module) return;

    const defaultModule = roleToModule[user.role];
    if (defaultModule) {
      setFormData(prev => ({ ...prev, module: defaultModule }));
    }
  }, [user?.role, formData.module]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch('http://localhost:8000/api/stock/products/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.results || []);
        setProducts(items);
      } catch (err) {
        setProducts([]);
      }
    };

    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch('http://localhost:8000/api/categories/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.results || []);
        setCategories(items);
      } catch (err) {
        setCategories([]);
      }
    };

    if (formData.module === 'stock') {
      fetchProducts();
      fetchCategories();
    }
  }, [formData.module]);

  /* ─── Data ───────────────────────────────────────────────── */
  const modules = [
    { value: 'stock',       label: 'Stock',       icon: <InventoryIcon />,   color: '#3b82f6' },
    { value: 'crm',         label: 'CRM',         icon: <PeopleIcon />,      color: '#22c55e' },
    { value: 'facturation', label: 'Facturation', icon: <DescriptionIcon />, color: '#f59e0b' },
    { value: 'gmao',        label: 'GMAO',        icon: <BuildIcon />,       color: '#ef4444' },
    { value: 'gpao',        label: 'GPAO',        icon: <FactoryIcon />,     color: '#a855f7' },
    { value: 'rh',          label: 'RH',          icon: <PeopleIcon />,      color: '#06b6d4' },
  ];

  const severityOptions = [
    { value: 'critical', label: 'Critique', color: '#ef4444' },
    { value: 'high',     label: 'Haute',    color: '#f97316' },
    { value: 'medium',   label: 'Moyenne',  color: '#3b82f6' },
    { value: 'low',      label: 'Basse',    color: '#22c55e' },
  ];

  const conditionTypes = [
    { value: 'threshold', label: 'Seuil',               icon: <SpeedIcon sx={{ fontSize: 18 }} />,    description: "Déclencher quand une valeur dépasse un seuil défini" },
    { value: 'absence',   label: 'Absence de données',  icon: <ErrorIcon sx={{ fontSize: 18 }} />,    description: "Déclencher en cas de données manquantes" },
    { value: 'anomaly',   label: "Détection d'anomalie",icon: <TimelineIcon sx={{ fontSize: 18 }} />, description: "Déclencher sur comportement statistiquement anormal" },
    { value: 'trend',     label: 'Tendance',             icon: <TrendingUpIcon sx={{ fontSize: 18 }} />, description: "Déclencher sur évolution de tendance significative" },
  ];

  const comparisonOperators = [
    { value: 'greater_than',         symbol: '>' },
    { value: 'less_than',            symbol: '<' },
    { value: 'equal_to',                symbol: '=' },
    { value: 'not_equal',     symbol: '\u2260' },
    { value: 'greater_equal',  symbol: '\u2265' },
    { value: 'less_equal',     symbol: '\u2264' },
  ];

  const notificationChannels = [
    { value: 'email',   label: 'Email',    icon: <EmailIcon sx={{ fontSize: 22 }} />,              color: '#ef4444' },
    { value: 'in-app',  label: 'In-App',   icon: <NotificationsIcon sx={{ fontSize: 22 }} />,      color: '#3b82f6' },
  ];

  const scheduleOptions = [
    { value: 'immediate', label: 'Temps réel',         icon: <PlayArrowIcon sx={{ fontSize: 18 }} />,  description: 'Vérification continue' },
    { value: 'hourly',    label: 'Toutes les heures',  icon: <ScheduleIcon sx={{ fontSize: 18 }} />,   description: 'Vérification horaire' },
    { value: 'daily',     label: 'Quotidien',          icon: <ScheduleIcon sx={{ fontSize: 18 }} />,   description: 'Une fois par jour' },
    { value: 'weekly',    label: 'Hebdomadaire',       icon: <ScheduleIcon sx={{ fontSize: 18 }} />,   description: 'Une fois par semaine' },
    { value: 'monthly',   label: 'Mensuel',            icon: <ScheduleIcon sx={{ fontSize: 18 }} />,   description: 'Une fois par mois' },
  ];

  const steps = ['Informations de base', 'Conditions de déclenchement', 'Notifications'];

  /* ─── Handlers ───────────────────────────────────────────── */
  const validateStep = (step) => {
    const errors = {};
    if (step === 0) {
      if (!formData.name.trim()) errors.name = 'Le nom est requis';
      if (!formData.module) errors.module = 'Veuillez sélectionner un module';
    }
    if (step === 1) {
      if (formData.compareTo === 'value' && !formData.thresholdValue) {
        errors.thresholdValue = 'Cette valeur est requise';
      }
      if (formData.module === 'stock' && formData.categories.length === 0) {
        errors.categories = 'Sélectionnez au moins une catégorie';
      }
    }
    if (step === 2) {
      if (formData.notificationChannels.length === 0) errors.channels = 'Sélectionnez au moins un canal';
      if (formData.recipients.length === 0) errors.recipients = 'Ajoutez au moins un destinataire';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (validationErrors[field]) setValidationErrors({ ...validationErrors, [field]: undefined });
  };

  const handleCategoriesChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, categories: value });
    if (validationErrors.categories) setValidationErrors({ ...validationErrors, categories: undefined });
  };

  const handleChannelToggle = (channel) => {
    const channels = [...formData.notificationChannels];
    const idx = channels.indexOf(channel);
    if (idx === -1) {
      channels.push(channel);
    } else {
      if (channels.length === 1) {
        showSnackbar('Au moins un canal doit être sélectionné', 'warning');
        return;
      }
      channels.splice(idx, 1);
    }
    setFormData({ ...formData, notificationChannels: channels });
    if (validationErrors.channels) setValidationErrors({ ...validationErrors, channels: undefined });
  };

  const handleAddRecipient = () => {
    if (!customRecipient) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const chatIdRegex = /^-?\d+$/;
    if (!emailRegex.test(customRecipient) && !customRecipient.startsWith('@') && !chatIdRegex.test(customRecipient)) {
      showSnackbar("Format invalide (email, @channel ou chat id)", 'error');
      return;
    }
    if (formData.recipients.includes(customRecipient)) {
      showSnackbar('Ce destinataire est déjà ajouté', 'warning');
      return;
    }
    setFormData({ ...formData, recipients: [...formData.recipients, customRecipient] });
    setCustomRecipient('');
    if (validationErrors.recipients) setValidationErrors({ ...validationErrors, recipients: undefined });
  };

  const handleRemoveRecipient = (r) =>
    setFormData({ ...formData, recipients: formData.recipients.filter(x => x !== r) });

  const showSnackbar = (msg, sev = 'success') => {
    setSnackbarMessage(msg);
    setSnackbarSeverity(sev);
    setOpenSnackbar(true);
  };

  const transition = (fn) => {
    setIsAnimating(true);
    setTimeout(() => { fn(); setIsAnimating(false); }, 180);
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      transition(() => setActiveStep(s => s + 1));
    } else {
      showSnackbar('Veuillez remplir tous les champs requis', 'error');
    }
  };

  const handleBack = () => transition(() => setActiveStep(s => s - 1));

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      showSnackbar('Veuillez vérifier tous les champs', 'error');
      return;
    }
    try {
      const token = localStorage.getItem('access_token');
      const alertData = {
        name: formData.name, description: formData.description,
        module: formData.module, severity: formData.severity,
        condition_type: formData.conditionType, threshold_value: formData.thresholdValue,
        comparison_operator: formData.comparisonOperator,
        condition_field: formData.conditionField,
        compare_to: formData.compareTo,
        categories: formData.categories,
        product: formData.product || null,
        notification_channels: formData.notificationChannels,
        recipients: formData.recipients,
        schedule: formData.schedule,
        custom_schedule: formData.customSchedule,
        repeat_until_resolved: formData.repeatUntilResolved,
        is_active: formData.isActive,
        tags: formData.tags,
      };
      const res = await fetch('http://localhost:8000/api/alerts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(alertData),
      });
      const responseText = await res.text();
      let responseJson = null;
      if (responseText) {
        try {
          responseJson = JSON.parse(responseText);
        } catch (parseError) {
          responseJson = null;
        }
      }
      if (!res.ok) {
        const message =
          responseJson?.message ||
          responseJson?.detail ||
          responseText ||
          `Erreur ${res.status}`;
        throw new Error(message);
      }
      showSnackbar("Règle d'alerte créée avec succès", 'success');
      setTimeout(() => navigate('/alerts'), 2000);
    } catch (err) {
      showSnackbar('Erreur : ' + err.message, 'error');
    }
  };

  /* ─── Threshold config panel ─────────────────────────────── */
  const thresholdPanel = {
    threshold: {
      title: 'Configuration du seuil',
      fields: (
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: T.textSecondary, fontSize: '0.875rem' }}>Opérateur de comparaison</InputLabel>
              <Select value={formData.comparisonOperator} onChange={handleInputChange('comparisonOperator')} label="Opérateur de comparaison" sx={selectSx}>
                {comparisonOperators.map(op => (
                  <MenuItem key={op.value} value={op.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography sx={{ fontFamily: 'monospace', fontSize: '1rem', color: T.accent, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{op.symbol}</Typography>
                      <Typography sx={{ color: T.textPrimary, fontSize: '0.875rem' }}>{op.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Valeur du seuil" type="number" placeholder="Ex: 100" value={formData.thresholdValue} onChange={handleInputChange('thresholdValue')} error={!!validationErrors.thresholdValue} helperText={validationErrors.thresholdValue} required sx={fieldSx(!!validationErrors.thresholdValue)} />
          </Grid>
        </Grid>
      ),
    },
    absence: {
      title: "Délai avant déclenchement",
      fields: <TextField fullWidth label="Durée sans données (minutes)" type="number" placeholder="Ex: 30" value={formData.thresholdValue} onChange={handleInputChange('thresholdValue')} error={!!validationErrors.thresholdValue} helperText={validationErrors.thresholdValue} required sx={fieldSx(!!validationErrors.thresholdValue)} />,
    },
    anomaly: {
      title: "Sensibilité de détection",
      fields: <TextField fullWidth label="Déviation standard (écarts-types)" type="number" placeholder="Ex: 2.5" value={formData.thresholdValue} onChange={handleInputChange('thresholdValue')} error={!!validationErrors.thresholdValue} helperText={validationErrors.thresholdValue || "Valeur plus élevée = sensibilité réduite"} required sx={fieldSx(!!validationErrors.thresholdValue)} />,
    },
    trend: {
      title: "Seuil de variation",
      fields: <TextField fullWidth label="Pourcentage d'augmentation" type="number" placeholder="Ex: 20" value={formData.thresholdValue} onChange={handleInputChange('thresholdValue')} error={!!validationErrors.thresholdValue} helperText={validationErrors.thresholdValue} required sx={fieldSx(!!validationErrors.thresholdValue)} />,
    },
  };

  /* ─── Step content ───────────────────────────────────────── */
  const renderStep = (step) => {
    switch (step) {
      case 0: return (
        <Fade in={!isAnimating} timeout={300}>
          <Stack spacing={4}>
            {/* General info */}
            <Box>
              <SectionHeader title="Informations générales" subtitle="Identifiez cette règle d'alerte" />
              <Stack spacing={2.5}>
                <TextField fullWidth label="Nom de la règle" placeholder="Ex: Alerte stock critique" value={formData.name} onChange={handleInputChange('name')} error={!!validationErrors.name} helperText={validationErrors.name} required sx={fieldSx(!!validationErrors.name)} />
                <TextField fullWidth label="Description (optionnel)" placeholder="Décrivez l'objectif de cette règle..." multiline rows={3} value={formData.description} onChange={handleInputChange('description')} sx={fieldSx()} />
              </Stack>
            </Box>

            <Divider sx={{ borderColor: T.border }} />

            {/* Module */}
            <Box>
              <SectionHeader title="Module ERP" subtitle="Sélectionnez le module concerné par cette règle" />
              <Grid container spacing={1.5}>
                {modules.map(m => {
                  const isLocked = Boolean(lockedModule) && m.value !== lockedModule;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={m.value}>
                      <SelectCard
                        selected={formData.module === m.value}
                        accentColor={m.color}
                        disabled={isLocked}
                        onClick={() => {
                          if (isLocked) return;
                          setFormData({ ...formData, module: m.value });
                          if (validationErrors.module) {
                            setValidationErrors({ ...validationErrors, module: undefined });
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ color: formData.module === m.value ? m.color : T.textMuted, display: 'flex', transition: 'color 0.18s' }}>
                            {React.cloneElement(m.icon, { sx: { fontSize: 26 } })}
                          </Box>
                          <Typography sx={{ color: T.textPrimary, fontWeight: 600, fontSize: '0.875rem' }}>{m.label}</Typography>
                        </Box>
                      </SelectCard>
                    </Grid>
                  );
                })}
              </Grid>
              {validationErrors.module && (
                <Typography variant="caption" sx={{ color: T.error, mt: 1.5, display: 'block' }}>{validationErrors.module}</Typography>
              )}
            </Box>

            <Divider sx={{ borderColor: T.border }} />

            {/* Severity */}
            <Box>
              <SectionHeader title="Niveau de priorité" subtitle="Définissez l'importance de cette alerte" />
              <Grid container spacing={1.5}>
                {severityOptions.map(s => (
                  <Grid item xs={6} sm={3} key={s.value}>
                    <SelectCard selected={formData.severity === s.value} accentColor={s.color} compact onClick={() => setFormData({ ...formData, severity: s.value })}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color, flexShrink: 0 }} />
                        <Typography sx={{ color: s.color, fontWeight: 700, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</Typography>
                      </Box>
                    </SelectCard>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Stack>
        </Fade>
      );

      case 1: return (
        <Fade in={!isAnimating} timeout={300}>
          <Stack spacing={4}>
            <Box>
              <SectionHeader title="Type de condition" subtitle="Définissez le comportement qui déclenchera cette règle" />
              <Grid container spacing={1.5}>
                {conditionTypes.map(c => (
                  <Grid item xs={12} sm={6} key={c.value}>
                    <SelectCard selected={formData.conditionType === c.value} onClick={() => setFormData({ ...formData, conditionType: c.value })}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box sx={{ color: formData.conditionType === c.value ? T.accent : T.textMuted, mt: 0.25, flexShrink: 0 }}>{c.icon}</Box>
                        <Box>
                          <Typography sx={{ color: T.textPrimary, fontWeight: 600, fontSize: '0.875rem', mb: 0.5 }}>{c.label}</Typography>
                          <Typography sx={{ color: T.textSecondary, fontSize: '0.8rem', lineHeight: 1.4 }}>{c.description}</Typography>
                        </Box>
                      </Box>
                    </SelectCard>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Divider sx={{ borderColor: T.border }} />

            <Box>
              <SectionHeader title={thresholdPanel[formData.conditionType]?.title || 'Configuration'} />
              <Box sx={{ p: 3, bgcolor: T.surfaceAlt, borderRadius: 2, border: `1px solid ${T.border}` }}>
                {formData.module === 'stock' && (
                  <Grid container spacing={2.5} sx={{ mb: 2 }}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: T.textSecondary, fontSize: '0.875rem' }}>Produit (optionnel)</InputLabel>
                        <Select
                          value={formData.product}
                          onChange={handleInputChange('product')}
                          label="Produit (optionnel)"
                          sx={selectSx}
                        >
                          <MenuItem value="">
                            <em>Tous les produits (filtre par catégories)</em>
                          </MenuItem>
                          {products.map((p) => (
                            <MenuItem key={p.id} value={p.id}>
                              {p.name} ({p.sku})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth error={!!validationErrors.categories}>
                        <InputLabel sx={{ color: T.textSecondary, fontSize: '0.875rem' }}>Catégories</InputLabel>
                        <Select
                          multiple
                          value={formData.categories}
                          onChange={handleCategoriesChange}
                          label="Catégories"
                          sx={selectSx}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip key={value} label={value} size="small" sx={{ bgcolor: 'rgba(59,130,246,0.15)', color: T.textPrimary }} />
                              ))}
                            </Box>
                          )}
                        >
                          {categories.map((cat) => (
                            <MenuItem key={cat.id} value={cat.name}>
                              {cat.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {validationErrors.categories && (
                          <Typography variant="caption" sx={{ color: T.error, mt: 0.75 }}>
                            {validationErrors.categories}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>
                  </Grid>
                )}
                {thresholdPanel[formData.conditionType]?.fields}
              </Box>
            </Box>
          </Stack>
        </Fade>
      );

      case 2: return (
        <Fade in={!isAnimating} timeout={300}>
          <Stack spacing={4}>
            {/* Channels */}
            <Box>
              <SectionHeader title="Canaux de notification" subtitle="Choisissez le ou les canaux de transmission des alertes" />
              <Grid container spacing={1.5}>
                {notificationChannels.map(ch => (
                  <Grid item xs={12} sm={4} key={ch.value}>
                    <SelectCard selected={formData.notificationChannels.includes(ch.value)} accentColor={ch.color} onClick={() => handleChannelToggle(ch.value)}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ color: formData.notificationChannels.includes(ch.value) ? ch.color : T.textMuted }}>{ch.icon}</Box>
                        <Typography sx={{ color: T.textPrimary, fontWeight: 600, fontSize: '0.875rem' }}>{ch.label}</Typography>
                      </Box>
                    </SelectCard>
                  </Grid>
                ))}
              </Grid>
              {validationErrors.channels && (
                <Typography variant="caption" sx={{ color: T.error, mt: 1.5, display: 'block' }}>{validationErrors.channels}</Typography>
              )}
            </Box>

            <Divider sx={{ borderColor: T.border }} />

            {/* Recipients */}
            <Box>
              <SectionHeader title="Destinataires" subtitle="Ajoutez les personnes qui recevront les notifications" />
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  placeholder="prenom.nom@entreprise.com"
                  value={customRecipient}
                  onChange={e => setCustomRecipient(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAddRecipient()}
                  error={!!validationErrors.recipients}
                  InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: T.textMuted, fontSize: 18 }} /></InputAdornment> }}
                  sx={fieldSx(!!validationErrors.recipients)}
                />
                <Button
                  variant="contained"
                  onClick={handleAddRecipient}
                  startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                  sx={{ bgcolor: T.accent, minWidth: { xs: '100%', sm: '130px' }, height: 48, fontWeight: 600, fontSize: '0.8125rem', letterSpacing: '0.02em', borderRadius: 1.5, boxShadow: 'none', '&:hover': { bgcolor: T.accentDark, boxShadow: `0 4px 12px ${T.accentGlow}` } }}
                >
                  Ajouter
                </Button>
              </Box>
              {validationErrors.recipients && (
                <Typography variant="caption" sx={{ color: T.error, mb: 1.5, display: 'block' }}>{validationErrors.recipients}</Typography>
              )}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, p: 2.5, bgcolor: T.surfaceAlt, borderRadius: 2, border: `1px dashed ${T.border}`, minHeight: 72, alignItems: 'flex-start' }}>
                {formData.recipients.length === 0
                  ? <Typography variant="body2" sx={{ color: T.textMuted, fontStyle: 'italic', width: '100%', textAlign: 'center', py: 1.5, fontSize: '0.8125rem' }}>Aucun destinataire ajouté</Typography>
                  : formData.recipients.map(r => (
                    <Chip key={r} label={r} onDelete={() => handleRemoveRecipient(r)} deleteIcon={<CloseIcon sx={{ fontSize: '14px !important' }} />}
                      sx={{ bgcolor: 'rgba(59,130,246,0.12)', color: T.textPrimary, border: '1px solid rgba(59,130,246,0.25)', height: 30, fontSize: '0.8rem', fontWeight: 500, '& .MuiChip-deleteIcon': { color: T.textSecondary, '&:hover': { color: T.error } } }}
                    />
                  ))}
              </Box>
            </Box>

            <Divider sx={{ borderColor: T.border }} />

            {/* Schedule */}
            <Box>
              <SectionHeader title="Fréquence de vérification" subtitle="Définissez à quelle fréquence la condition sera évaluée" />
              <Grid container spacing={1.5}>
                {scheduleOptions.map(s => (
                  <Grid item xs={12} sm={6} md={4} key={s.value}>
                    <SelectCard selected={formData.schedule === s.value} onClick={() => setFormData({ ...formData, schedule: s.value })}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box sx={{ color: formData.schedule === s.value ? T.accent : T.textMuted, mt: 0.25 }}>{s.icon}</Box>
                        <Box>
                          <Typography sx={{ color: T.textPrimary, fontWeight: 600, fontSize: '0.875rem', mb: 0.25 }}>{s.label}</Typography>
                          <Typography sx={{ color: T.textSecondary, fontSize: '0.78rem' }}>{s.description}</Typography>
                        </Box>
                      </Box>
                    </SelectCard>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Stack>
        </Fade>
      );

      default: return null;
    }
  };

  /* ─── Render ─────────────────────────────────────────────── */
  return (
    <Box sx={{ bgcolor: T.bg, minHeight: '100vh', py: 5 }}>
      <Container maxWidth="lg">

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 5 }}>
          <Box sx={{ p: 1.25, bgcolor: 'rgba(59,130,246,0.1)', border: `1px solid rgba(59,130,246,0.2)`, borderRadius: 2, display: 'flex' }}>
            <NotificationsIcon sx={{ color: T.accent, fontSize: 26 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ color: T.textPrimary, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Nouvelle règle d'alerte
            </Typography>
            <Typography variant="body2" sx={{ color: T.textSecondary, mt: 0.25, fontSize: '0.8125rem' }}>
              Configurez une règle pour recevoir des notifications automatiques
            </Typography>
          </Box>
        </Box>

        {/* Progress Bar + Step Indicator */}
        <Paper sx={{ p: 0, mb: 3.5, bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: 2, overflow: 'hidden' }}>
          <LinearProgress
            variant="determinate"
            value={((activeStep + 1) / steps.length) * 100}
            sx={{
              height: 3,
              bgcolor: 'rgba(255,255,255,0.05)',
              '& .MuiLinearProgress-bar': { bgcolor: T.accent, transition: 'transform 0.4s ease' },
            }}
          />
          <Box sx={{ display: 'flex', px: 4, py: 3, gap: 0 }}>
            {steps.map((label, i) => {
              const done = i < activeStep;
              const active = i === activeStep;
              return (
                <React.Fragment key={label}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      bgcolor: done ? T.success : active ? T.accent : 'transparent',
                      border: done || active ? 'none' : `1.5px solid ${T.border}`,
                      transition: 'all 0.2s',
                    }}>
                      {done
                        ? <CheckCircleIcon sx={{ fontSize: 16, color: 'white' }} />
                        : <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: active ? 'white' : T.textMuted }}>{i + 1}</Typography>}
                    </Box>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: active ? 700 : 500, color: active ? T.textPrimary : done ? T.success : T.textMuted, letterSpacing: '-0.01em' }}>
                        {label}
                      </Typography>
                    </Box>
                  </Box>
                  {i < steps.length - 1 && (
                    <Box sx={{ flex: 1, height: 1, bgcolor: i < activeStep ? T.success : T.border, mx: 2, alignSelf: 'center', transition: 'background-color 0.3s' }} />
                  )}
                </React.Fragment>
              );
            })}
          </Box>
        </Paper>

        {/* Form content */}
        <Paper sx={{ p: { xs: 3, md: 5 }, mb: 3, bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: 2, minHeight: 480 }}>
          {renderStep(activeStep)}
        </Paper>

        {/* Navigation footer */}
        <Paper sx={{ p: 2.5, bgcolor: T.surface, border: `1px solid ${T.border}`, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

            {/* Back */}
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
              sx={{
                color: T.textSecondary, fontWeight: 600, fontSize: '0.8125rem', px: 2.5, py: 1, borderRadius: 1.5,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', color: T.textPrimary },
                '&:disabled': { color: T.textMuted },
              }}
            >
              Retour
            </Button>

            {/* Page indicator */}
            <Typography sx={{ color: T.textSecondary, fontSize: '0.8125rem', fontWeight: 500, letterSpacing: '0.02em' }}>
              Page{' '}
              <Box component="span" sx={{ color: T.textPrimary, fontWeight: 700 }}>{activeStep + 1}</Box>
              {' '}/{' '}
              <Box component="span" sx={{ color: T.textPrimary, fontWeight: 700 }}>{steps.length}</Box>
            </Typography>

            {/* Next / Submit */}
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                startIcon={<SaveIcon sx={{ fontSize: 18 }} />}
                sx={{ bgcolor: T.success, color: 'white', px: 3.5, py: 1, fontWeight: 700, fontSize: '0.8125rem', borderRadius: 1.5, boxShadow: 'none', letterSpacing: '0.02em', '&:hover': { bgcolor: '#16a34a', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' } }}
              >
                Créer la règle
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ChevronRightIcon sx={{ fontSize: 18 }} />}
                sx={{ bgcolor: T.accent, color: 'white', px: 3.5, py: 1, fontWeight: 700, fontSize: '0.8125rem', borderRadius: 1.5, boxShadow: 'none', letterSpacing: '0.02em', '&:hover': { bgcolor: T.accentDark, boxShadow: `0 4px 12px ${T.accentGlow}` } }}
              >
                Suivant
              </Button>
            )}
          </Box>
        </Paper>

      </Container>

      {/* Snackbar */}
      <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={() => setOpenSnackbar(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} variant="filled" sx={{ width: '100%', borderRadius: 1.5, boxShadow: '0 4px 16px rgba(0,0,0,0.4)', fontSize: '0.875rem' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NewAlert;
