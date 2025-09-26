// frontend/src/pages/RelatoriosPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography, Box, Container, Button, CircularProgress } from '@mui/material'; // Adicionado Button e CircularProgress
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function RelatoriosPage() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true); // Estado para controlar o carregamento
  const { authHeader } = useAuth();

  useEffect(() => {
    const fetchDadosRelatorio = async () => {
      try {
        setLoading(true); // Inicia o carregamento
        const response = await axios.get('http://localhost:3001/api/relatorios/novos-alunos', authHeader());
        
        const dadosFormatados = response.data.map(item => ({
          mes: item.mes,
          quantidade: parseInt(item.quantidade, 10)
        }));
        setDados(dadosFormatados);

      } catch (error) {
        console.error("Erro ao buscar dados do relatório:", error);
        toast.error("Não foi possível carregar os dados do relatório.");
      } finally {
        setLoading(false); // Finaliza o carregamento, com sucesso ou erro
      }
    };

    // A verificação authHeader garante que a função só rode quando o header estiver pronto
    if (authHeader) {
      fetchDadosRelatorio();
    }
  }, [authHeader]);

  // Se estiver carregando, mostra um indicador
  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Button component={Link} to="/dashboard" variant="outlined" sx={{ mb: 2 }}>
          Voltar para o Dashboard
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          Relatório de Novos Alunos por Mês
        </Typography>
        <Paper sx={{ p: 2, mt: 2, height: 400 }}>
          {/* Garante que o gráfico só renderize se tiver dados */}
          {dados.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dados} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantidade" fill="#8884d8" name="Novos Alunos" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Typography sx={{ textAlign: 'center', mt: 4 }}>
              Não há dados suficientes para exibir o relatório.
            </Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default RelatoriosPage;