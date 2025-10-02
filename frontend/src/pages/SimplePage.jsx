// frontend/src/pages/SimplePage.jsx
import React from 'react';
import { 
  Container, Box, Typography, Paper, Button
} from '@mui/material';

const SimplePage = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            PlankGYM - Sistema de Gestão para Academias
          </Typography>
          <Typography variant="body1">
            Bem-vindo ao sistema. Esta é uma página simples para diagnóstico.
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button variant="contained" color="primary" href="/login">
            Ir para Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SimplePage;