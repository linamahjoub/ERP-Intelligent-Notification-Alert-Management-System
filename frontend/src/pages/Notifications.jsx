import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const Notifications = () => {
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Notifications
        </Typography>
        <Typography variant="body1">
          Page des notifications (en développement)
        </Typography>
      </Paper>
    </Container>
  );
};

export default Notifications;