// frontend/src/pages/AulasPage.jsx
import React, { useState } from 'react';
import { 
  Container, Box, Typography, Paper, Tab, Tabs, Divider
} from '@mui/material';
import { CalendarMonth, Add } from '@mui/icons-material';
import Layout from '../components/Layout';
import AulasCalendario from '../components/AulasCalendario';
import AulasForm from '../components/AulasForm';

const AulasPage = () => {
  const [tabAtual, setTabAtual] = useState(0);

  const handleChangeTab = (event, newValue) => {
    setTabAtual(newValue);
  };

  const handleAulaAdicionada = () => {
    setTabAtual(0); // Voltar para a tab de calendário após adicionar uma aula
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Aulas e Atividades
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie aulas, atividades coletivas e eventos da academia
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ mb: 4 }}>
          <Tabs
            value={tabAtual}
            onChange={handleChangeTab}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab icon={<CalendarMonth />} label="Calendário" />
            <Tab icon={<Add />} label="Adicionar Aula" />
          </Tabs>
          
          <Divider />
          
          <Box p={3}>
            {tabAtual === 0 ? (
              <AulasCalendario isAluno={false} />
            ) : (
              <AulasForm onAulaAdicionada={handleAulaAdicionada} />
            )}
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
};

export default AulasPage;