import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Typography, Box, TextField, FormControl, InputLabel, Select, MenuItem,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AlunosForm from '../components/AlunosForm';
import AlunosList from '../components/AlunosList';
import { API_BASE } from '../services/api';

function AlunosPage() {
  const [planos, setPlanos] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const { authHeader } = useAuth();

  const fetchPlanos = async () => {
    try {
      const response = await axios.get(`${API_BASE}/planos`, authHeader());
      setPlanos(response.data);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
    }
  };

  const fetchAlunos = async () => {
    try {
      const response = await axios.get(`${API_BASE}/alunos`, authHeader());
      setAlunos(response.data);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    }
  };

  useEffect(() => {
    if (authHeader) {
      fetchPlanos();
      fetchAlunos();
    }
  }, [authHeader]);

  const alunosFiltrados = useMemo(() => {
    return alunos.filter(aluno => {
      const busca = termoBusca.toLowerCase();
      const status = filtroStatus;
      const matchBusca = aluno.nome_completo.toLowerCase().includes(busca) || aluno.email.toLowerCase().includes(busca);
      const matchStatus = status === 'todos' || aluno.status === status;
      return matchBusca && matchStatus;
    });
  }, [alunos, termoBusca, filtroStatus]);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Gerenciar Alunos
      </Typography>

      {/* 1. Acordeão do Formulário, começando expandido */}
      <Accordion defaultExpanded sx={{ mb: 4 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Cadastrar Novo Aluno</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <AlunosForm planos={planos} onAlunoAdicionado={fetchAlunos} />
        </AccordionDetails>
      </Accordion>

      {/* 2. Acordeão da Lista e Filtros, começando expandido */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Lista de Alunos</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Buscar por Nome ou Email"
              variant="outlined"
              size="small"
              fullWidth
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filtroStatus}
                label="Status"
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="ativo">Ativo</MenuItem>
                <MenuItem value="inativo">Inativo</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <AlunosList
            alunos={alunosFiltrados}
            planos={planos}
            onAlunoExcluido={fetchAlunos}
            onAlunoAtualizado={fetchAlunos}
          />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

export default AlunosPage;