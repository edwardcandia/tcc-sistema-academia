// frontend/src/pages/PlanosPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Typography, Box } from '@mui/material';
import PlanosForm from '../components/PlanosForm';
import PlanosList from '../components/PlanosList';

function PlanosPage() {
  const [planos, setPlanos] = useState([]);
  const { authHeader } = useAuth();

  const fetchPlanos = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/planos', authHeader());
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
      <PlanosForm onPlanoAdicionado={fetchPlanos} />
      <PlanosList
        planos={planos}
        onPlanoExcluido={fetchPlanos}
        onPlanoAtualizado={fetchPlanos}
      />
    </Box>
  );
}

export default PlanosPage;