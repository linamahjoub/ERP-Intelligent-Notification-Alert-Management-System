import React, { useState } from 'react';
import { Button, Box, Typography, Alert, Paper } from '@mui/material';

const DebugRegistration = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testBackendRegistration = async () => {
    setLoading(true);
    const testData = {
      email: `test${Date.now()}@example.com`,
      username: `user${Date.now()}`,
      password: 'Test123!',
      password2: 'Test123!',
      first_name: 'Test',
      last_name: 'User'
    };

    try {
      const response = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const data = await response.json();
      setTestResult({
        status: response.status,
        data: data,
        success: response.ok
      });
    } catch (error) {
      setTestResult({
        status: 'ERROR',
        data: error.message,
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, margin: '0 auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          🐛 Débogage Inscription
        </Typography>
        
        <Button 
          variant="outlined" 
          onClick={testBackendRegistration}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          {loading ? 'Test en cours...' : 'Tester l\'inscription backend'}
        </Button>

        {testResult && (
          <Alert 
            severity={testResult.success ? "success" : "error"}
            sx={{ mt: 2 }}
          >
            <Typography variant="body2">
              <strong>Status:</strong> {testResult.status}<br/>
              <strong>Réponse:</strong> {JSON.stringify(testResult.data, null, 2)}
            </Typography>
          </Alert>
        )}

        <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary' }}>
          Cette fonction teste directement le backend Django pour vérifier
          que l'API d'inscription fonctionne correctement.
        </Typography>
      </Paper>
    </Box>
  );
};

export default DebugRegistration;
