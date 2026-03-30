import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, CircularProgress, Divider, Card, CardContent, Alert } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Timeline, FitnessCenter, CalendarMonth } from '@mui/icons-material';
import { API_BASE } from '../services/api';

// Registrando componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AlunoProgressoCharts = () => {
  const { authHeader, aluno } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estatisticas, setEstatisticas] = useState(null);
  const [frequenciaSemanal, setFrequenciaSemanal] = useState([]);
  const [avaliacoesTreino, setAvaliacoesTreino] = useState([]);

  useEffect(() => {
    const fetchProgressoData = async () => {
      if (!authHeader || !aluno) return;
      
      setLoading(true);
      setError(null);

      try {
        // Buscar estatísticas gerais
        const estatisticasRes = await axios.get(
          `${API_BASE}/registro-treino/estatisticas`, 
          authHeader()
        );
        setEstatisticas(estatisticasRes.data.data);
        
        // Buscar dados para gráfico de frequência semanal
        const frequenciaRes = await axios.get(
          `${API_BASE}/registro-treino/frequencia`,
          authHeader()
        );
        setFrequenciaSemanal(frequenciaRes.data.data || []);
        
        // Buscar dados para gráfico de avaliação dos treinos
        const avaliacoesRes = await axios.get(
          `${API_BASE}/registro-treino/avaliacoes`,
          authHeader()
        );
        setAvaliacoesTreino(avaliacoesRes.data.data || []);
        
      } catch (err) {
        console.error("Erro ao buscar dados de progresso:", err);
        setError("Não foi possível carregar os dados de progresso. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchProgressoData();
  }, [authHeader, aluno]);

  if (loading) {
    return (
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Preparar dados para o gráfico de frequência semanal
  const dadosFrequencia = {
    labels: frequenciaSemanal.map(item => item.dia),
    datasets: [
      {
        label: 'Total de Treinos',
        data: frequenciaSemanal.map(item => item.total),
        backgroundColor: '#4CAF50',
        borderColor: '#2E7D32',
        borderWidth: 2,
        tension: 0.3,
        fill: true
      }
    ]
  };

  // Preparar dados para o gráfico de avaliação dos treinos
  const dadosAvaliacao = {
    labels: avaliacoesTreino.map(item => item.nome),
    datasets: [
      {
        label: 'Avaliação média',
        data: avaliacoesTreino.map(item => parseFloat(item.avaliacao_media || 0).toFixed(1)),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ]
      }
    ]
  };

  // Preparar dados para o gráfico de distribuição de treinos
  const dadosDistribuicao = {
    labels: estatisticas?.por_treino?.map(item => item.nome) || [],
    datasets: [
      {
        label: 'Vezes realizado',
        data: estatisticas?.por_treino?.map(item => parseInt(item.vezes_realizado || 0, 10)) || [],
        backgroundColor: [
          '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#d35400'
        ]
      }
    ]
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Timeline color="primary" sx={{ mr: 1 }} />
        <Typography variant="h5">Sua Evolução</Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />

      {/* Cards com resumos */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom variant="overline">
                Total de Treinos
              </Typography>
              <Typography variant="h3" component="div" sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
                {estatisticas?.resumo?.total_treinos || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom variant="overline">
                Minutos Treinados
              </Typography>
              <Typography variant="h3" component="div" sx={{ color: '#1976D2', fontWeight: 'bold' }}>
                {estatisticas?.resumo?.tempo_total || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom variant="overline">
                Média de Avaliação
              </Typography>
              <Typography variant="h3" component="div" sx={{ color: '#F57C00', fontWeight: 'bold' }}>
                {estatisticas?.resumo?.media_avaliacao || '0.0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Frequência semanal */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarMonth color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Frequência por Dia da Semana</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
              {frequenciaSemanal.length > 0 ? (
                <Line 
                    data={dadosFrequencia} 
                    options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                        }
                    }
                    }} 
                />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography color="text.secondary">Sem dados de frequência suficientes</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Distribuição de treinos */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FitnessCenter color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Distribuição de Treinos</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
              {avaliacoesTreino.length > 0 ? (
                <Doughnut 
                    data={dadosDistribuicao}
                    options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                        position: 'bottom'
                        }
                    }
                    }}
                />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography color="text.secondary">Sem dados de distribuição suficientes</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Avaliação dos treinos */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUp color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Avaliação Média por Treino</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: 300 }}>
              {avaliacoesTreino.length > 0 ? (
                <Bar 
                    data={dadosAvaliacao}
                    options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                            stepSize: 1
                        }
                        }
                    }
                    }}
                />
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography color="text.secondary">Sem dados de avaliação suficientes</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AlunoProgressoCharts;