import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Typography, Box, Accordion, AccordionSummary, AccordionDetails 
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlanosForm from '../components/PlanosForm';
import PlanosList from '../components/PlanosList';
import { API_BASE } from '../services/api';

function PlanosPage() {
  const [planos, setPlanos] = useState([]);
  const { authHeader } = useAuth();

  const fetchPlanos = async () => {
    try {
      const response = await axios.get(`${API_BASE}/planos`, authHeader());
      setPlanos(response.data);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
    }
  };

  useEffect(() => {
    if (authHeader) {
      fetchPlanos();
    }
  }, [authHeader]);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Gerenciar Planos
      </Typography>

      {/* 1. Acordeão do Formulário, começando expandido */}
      <Accordion defaultExpanded sx={{ mb: 4 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Cadastrar Novo Plano</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <PlanosForm onPlanoAdicionado={fetchPlanos} />
        </AccordionDetails>
      </Accordion>

      {/* 2. Acordeão da Lista, começando expandido */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Lista de Planos</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <PlanosList
            planos={planos}
            onPlanoExcluido={fetchPlanos}
            onPlanoAtualizado={fetchPlanos}
          />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

export default PlanosPage;