import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const Settings = () => {
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Paramètres
        </Typography>
        <Typography variant="body1">
          Page des paramètres (en développement)
        </Typography>
      </Paper>
    </Container>
  );
};

export default Settings;