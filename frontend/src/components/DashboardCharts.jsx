import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, CircularProgress, Divider } from '@mui/material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import axios from 'axios';
import { API_BASE } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, DonutLarge, BarChart } from '@mui/icons-material';

// Registrando componentes do Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

function DashboardCharts() {
  const { authHeader, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusAlunos, setStatusAlunos] = useState([]);
  const [distribuicaoPlanos, setDistribuicaoPlanos] = useState([]);
  const [historicoPagamentos, setHistoricoPagamentos] = useState({ meses: [], valores: [] });
  
  const isAdmin = user && user.cargo === 'administrador';

  useEffect(() => {
    const fetchChartData = async () => {
      if (!authHeader) return;
      
      setLoading(true);
      setError(null);

      try {
        const [statusRes, planosRes, pagamentosRes] = await Promise.all([
          axios.get(`${API_BASE}/dashboard/status-alunos`, authHeader()),
          axios.get(`${API_BASE}/dashboard/distribuicao-planos`, authHeader()),
          axios.get(`${API_BASE}/dashboard/historico-pagamentos`, authHeader())
        ]);

        setStatusAlunos(statusRes.data);
        setDistribuicaoPlanos(planosRes.data);
        setHistoricoPagamentos(pagamentosRes.data);
      } catch (err) {
        console.error("Erro ao buscar dados para gráficos:", err);
        setError("Não foi possível carregar os dados dos gráficos. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [authHeader]);

  // Preparar dados para o gráfico de status de alunos
  const statusData = {
    labels: statusAlunos.map(item => {
      // Formatar status para exibição
      switch(item.status) {
        case 'ativo': return 'Ativos';
        case 'inativo': return 'Inativos';
        case 'pendente': return 'Pendentes';
        default: return item.status;
      }
    }),
    datasets: [
      {
        data: statusAlunos.map(item => parseInt(item.total, 10)),
        backgroundColor: ['#4CAF50', '#F44336', '#FFC107'],
        hoverBackgroundColor: ['#388E3C', '#D32F2F', '#FFB300'],
      }
    ]
  };

  // Preparar dados para o gráfico de distribuição de planos
  // Garantir que todos os valores são inteiros
  const planosData = {
    labels: distribuicaoPlanos.map(p => p.nome),
    datasets: [
      {
        label: 'Número de Alunos',
        data: distribuicaoPlanos.map(p => Math.round(parseInt(p.total_alunos, 10))), // Arredondar para garantir valores inteiros
        backgroundColor: [
          '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#d35400'
        ]
      }
    ]
  };

  // Preparar dados para o gráfico de histórico de pagamentos
  const dadosPagamentos = {
    labels: historicoPagamentos.meses,
    datasets: [
      {
        label: 'Pagamentos Recebidos (R$)',
        data: historicoPagamentos.valores,
        backgroundColor: '#2196F3',
      }
    ]
  };

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

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TrendingUp color="primary" sx={{ mr: 1 }} />
        <Typography variant="h5">Estatísticas e Indicadores</Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        {/* Status dos alunos */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DonutLarge color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Status dos Alunos</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
              <Pie 
                data={statusData} 
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
        
        {/* Distribuição por planos */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BarChart color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Distribuição por Planos</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
              <Bar 
                data={planosData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0, // Force integer ticks with no decimals
                        stepSize: 1,  // Force step size to 1
                        callback: function(value) {
                          return Math.floor(value); // Ensure only integers are displayed
                        }
                      }
                    }
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          // Force integer values in tooltips
                          return context.dataset.label + ': ' + Math.round(context.raw);
                        }
                      }
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
        
        {/* Receita mensal - apenas para administradores */}
        {isAdmin && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Receita dos Últimos 6 Meses</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ height: 300 }}>
                <Bar 
                  data={dadosPagamentos}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                          }
                        }
                      }
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return 'R$ ' + context.parsed.y.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            });
                          }
                        }
                      }
                    }
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default DashboardCharts;