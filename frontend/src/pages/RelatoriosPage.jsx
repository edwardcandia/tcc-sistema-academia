// frontend/src/pages/RelatoriosPage.jsx
import React, { useState, useEffect, useRef } from 'react'; // 1. Importar o useRef
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Paper, Typography, Box, Container, Button, Grid, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Chart as ChartJS, CategoryScale, LinearScale, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Pie } from 'react-chartjs-2';
ChartJS.register(CategoryScale, LinearScale, Title, Tooltip, Legend, ArcElement);

function RelatoriosPage() {
  const [dadosGrafico, setDadosGrafico] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const { authHeader, token } = useAuth();

  // 2. Criar uma referência para controlar se a busca já foi feita
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    // 3. Garantir que a busca só aconteça se o token existir E se ainda não tiver sido feita
    if (token && !dataFetchedRef.current) {
      const fetchDados = async () => {
        try {
          setLoading(true);
          const response = await axios.get('http://localhost:3001/api/relatorios/alunos-por-plano', authHeader());
          
          if (response.data && response.data.length > 0) {
            const dadosFormatados = {
              labels: response.data.map(item => item.nome),
              datasets: [{
                label: 'Alunos por Plano',
                data: response.data.map(item => item.quantidade),
                backgroundColor: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'],
              }],
            };
            setDadosGrafico(dadosFormatados);
          }
        } catch (error) {
          toast.error("Não foi possível carregar os dados.");
        } finally {
          setLoading(false);
        }
      };
      
      fetchDados();
      // 4. Marcar que a busca foi feita para não repetir
      dataFetchedRef.current = true;
    } else if (!token) {
        // Se o token não estiver pronto, não faz nada ainda
        setLoading(true);
    } else {
        // Se o token já existe e a busca já foi feita, apenas para de carregar
        setLoading(false);
    }
  }, [token]); // O useEffect depende apenas do token agora

  if (loading) {
    return <Container><Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box></Container>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Button component={Link} to="/dashboard" variant="outlined" sx={{ mb: 2 }}>Voltar</Button>
        <Typography variant="h4" component="h1" gutterBottom>Relatórios</Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '450px' }}>
              <Typography variant="h6" gutterBottom>Distribuição de Alunos por Plano</Typography>
              <Box sx={{ height: 350, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {(dadosGrafico.labels && dadosGrafico.labels.length > 0) ? (
                  <Pie options={{ responsive: true, maintainAspectRatio: false }} data={dadosGrafico} />
                ) : (
                  <p>Sem dados para exibir.</p>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default RelatoriosPage;