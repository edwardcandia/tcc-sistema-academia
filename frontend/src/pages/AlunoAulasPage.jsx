// frontend/src/pages/AlunoAulasPage.jsx
import React from 'react';
import { 
  Container, Box, Typography, Paper, Alert
} from '@mui/material';
import AulasCalendario from '../components/AulasCalendario';
import { useAuth } from '../context/AuthContext';

const AlunoAulasPage = () => {
  const { aluno } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Aulas e Atividades
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Confira a programação de aulas e atividades e faça sua inscrição
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Olá, {aluno?.nome_completo || 'Aluno'}! Clique em uma aula para ver detalhes e fazer sua inscrição.
      </Alert>

      <Paper elevation={3}>
        <Box p={3}>
          <AulasCalendario isAluno={true} />
        </Box>
      </Paper>
    </Container>
  );
};

export default AlunoAulasPage;