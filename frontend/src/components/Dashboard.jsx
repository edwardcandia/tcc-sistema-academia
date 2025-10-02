// frontend/src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Paper, Typography, Box } from '@mui/material';

function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalAlunos: 0,
    alunosAtivos: 0,
    totalPlanos: 0,
    receitaMensal: '0.00',
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/dashboard/metrics');
        setMetrics(response.data);
      } catch (error) {
        console.error("Erro ao buscar métricas do dashboard:", error);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        PlankGYM - Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total de Alunos</Typography>
            <Typography variant="h4">{metrics.totalAlunos}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Alunos Ativos</Typography>
            <Typography variant="h4">{metrics.alunosAtivos}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Receita Mensal (Est.)</Typography>
            <Typography variant="h4">R$ {metrics.receitaMensal}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total de Planos</Typography>
            <Typography variant="h4">{metrics.totalPlanos}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;