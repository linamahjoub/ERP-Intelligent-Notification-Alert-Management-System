import React, { useState } from 'react';
import { Container, Typography, Paper, Box, useTheme, useMediaQuery, IconButton, AppBar, Toolbar } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import SharedSidebar from '../components/SharedSidebar';

const Settings = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'black' }}>
      <SharedSidebar mobileOpen={mobileOpen} onMobileClose={handleDrawerToggle} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: isMobile ? '100%' : 'calc(100% - 280px)',
          minHeight: '100vh',
          bgcolor: 'black',
        }}
      >
        {/* Header mobile */}
        {isMobile && (
          <AppBar position="sticky" sx={{ bgcolor: 'black', borderBottom: '1px solid rgba(59,130,246,0.1)' }}>
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={{ color: 'white' }}>
                Paramètres
              </Typography>
            </Toolbar>
          </AppBar>
        )}
        
        <Box sx={{ p: 3 }}>
          <Container maxWidth="md">
          <Paper elevation={3} sx={{ p: 4, mt: 4, bgcolor: 'rgba(30,41,59,0.5)', border: '1px solid rgba(59,130,246,0.1)' }}>
            <Typography variant="h4" gutterBottom sx={{ color: 'white' }}>
              Paramètres
            </Typography>
            <Typography variant="body1" sx={{ color: '#94a3b8' }}>
              Page des paramètres (en développement)
            </Typography>
          </Paper>
        </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Settings;