import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, CircularProgress, Divider, Card, CardContent } from '@mui/material';
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
import { format, parseISO, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
      if (!authHeader() || !aluno) return;
      
      setLoading(true);
      setError(null);

      try {
        // Buscar estatísticas gerais
        const estatisticasRes = await axios.get(
          `${API_BASE}/registro-treino/estatisticas`, 
          authHeader()
        );
        setEstatisticas(estatisticasRes.data.data);
        
        // Buscar dados para gráfico de frequência nas últimas 4 semanas
        const hoje = new Date();
        const dataInicio = format(subDays(hoje, 28), 'yyyy-MM-dd');
        const dataFim = format(hoje, 'yyyy-MM-dd');
        
        const frequenciaRes = await axios.get(
          `${API_BASE}/registro-treino/frequencia?dataInicio=${dataInicio}&dataFim=${dataFim}`,
          authHeader()
        );
        setFrequenciaSemanal(frequenciaRes.data.data);
        
        // Buscar dados para gráfico de avaliação dos treinos
        const avaliacoesRes = await axios.get(
          `${API_BASE}/registro-treino/avaliacoes`,
          authHeader()
        );
        setAvaliacoesTreino(avaliacoesRes.data.data);
        
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
        <Typography color="error" variant="body1">{error}</Typography>
      </Box>
    );
  }

  // Preparar dados para o gráfico de frequência semanal
  const dadosFrequencia = {
    labels: frequenciaSemanal.map(item => format(parseISO(item.semana), "dd/MM", { locale: ptBR })),
    datasets: [
      {
        label: 'Treinos por semana',
        data: frequenciaSemanal.map(item => item.total_treinos),
        backgroundColor: '#4CAF50',
        borderColor: '#2E7D32',
        borderWidth: 2,
        tension: 0.3
      }
    ]
  };

  // Preparar dados para o gráfico de avaliação dos treinos
  const dadosAvaliacao = {
    labels: avaliacoesTreino.map(item => item.treino_nome),
    datasets: [
      {
        label: 'Avaliação média',
        data: avaliacoesTreino.map(item => parseFloat(item.avaliacao_media).toFixed(1)),
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
    labels: estatisticas?.treinos_por_tipo.map(item => item.nome) || [],
    datasets: [
      {
        label: 'Treinos realizados',
        data: estatisticas?.treinos_por_tipo.map(item => parseInt(item.quantidade, 10)) || [],
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
        <Typography variant="h5">Seu Progresso</Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />

      {/* Cards com resumos */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                Total de Treinos
              </Typography>
              <Typography variant="h3" component="div">
                {estatisticas?.total_treinos || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                Horas Treinadas
              </Typography>
              <Typography variant="h3" component="div">
                {Math.floor((estatisticas?.tempo_total || 0) / 60)}h
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                Média Avaliação
              </Typography>
              <Typography variant="h3" component="div">
                {estatisticas?.avaliacao_media ? parseFloat(estatisticas.avaliacao_media).toFixed(1) : '0.0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                Treinos este mês
              </Typography>
              <Typography variant="h3" component="div">
                {estatisticas?.frequencia_mensal
                  .filter(item => {
                    const hoje = new Date();
                    const inicioMes = format(startOfMonth(hoje), 'yyyy-MM');
                    return item.mes === inicioMes;
                  })
                  .reduce((acc, curr) => acc + parseInt(curr.quantidade), 0) || 0}
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
              <Typography variant="h6">Frequência nas últimas 4 semanas</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
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
                  },
                  plugins: {
                    title: {
                      display: false
                    }
                  }
                }} 
              />
            </Box>
          </Paper>
        </Grid>
        
        {/* Distribuição de treinos */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FitnessCenter color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Distribuição por Tipo de Treino</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
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
            </Box>
          </Paper>
        </Grid>
        
        {/* Avaliação dos treinos */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUp color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Avaliação por Tipo de Treino</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: 300 }}>
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
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AlunoProgressoCharts;