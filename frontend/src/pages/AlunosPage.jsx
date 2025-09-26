// frontend/src/pages/AlunosPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Typography, Box, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import AlunosForm from '../components/AlunosForm';
import AlunosList from '../components/AlunosList';

function AlunosPage() {
  const [planos, setPlanos] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const { authHeader } = useAuth();

  // Função para buscar os planos (necessário para o formulário de alunos)
  const fetchPlanos = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/planos', authHeader());
      setPlanos(response.data);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
    }
  };

  // Função para buscar os alunos
  const fetchAlunos = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/alunos', authHeader());
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
      <AlunosForm planos={planos} onAlunoAdicionado={fetchAlunos} />
      <AlunosList
        alunos={alunosFiltrados}
        planos={planos}
        onAlunoExcluido={fetchAlunos}
        onAlunoAtualizado={fetchAlunos}
      />
    </Box>
  );
}

export default AlunosPage;