import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useParams, Link } from 'react-router-dom';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, TextField, Grid, Autocomplete, CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import { API_BASE } from '../services/api';

function ModeloTreinoDetalhePage() {
  const { id } = useParams();
  const { authHeader } = useAuth();
  const [modelo, setModelo] = useState(null);
  const [todosExercicios, setTodosExercicios] = useState([]);
  const [formExercicio, setFormExercicio] = useState({
    exercicio_id: '',
    series: '',
    repeticoes: '',
    descanso_segundos: ''
  });
  const [autocompleteValue, setAutocompleteValue] = useState(null);

  const fetchDetalhesModelo = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/modelos-treino/${id}`, authHeader());
      setModelo(response.data);
    } catch (error) {
      toast.error("Falha ao carregar detalhes do modelo.");
    }
  }, [id, authHeader]);

  const fetchTodosExercicios = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/exercicios`, authHeader());
      setTodosExercicios(response.data);
    } catch (error) {
      toast.error("Falha ao carregar a biblioteca de exercícios.");
    }
  }, [authHeader]);

  useEffect(() => {
    if (authHeader) {
      fetchDetalhesModelo();
      fetchTodosExercicios();
    }
  }, [authHeader, fetchDetalhesModelo, fetchTodosExercicios]);

  const handleFormChange = (e) => {
    setFormExercicio({ ...formExercicio, [e.target.name]: e.target.value });
  };

  const handleAddExercicio = async (e) => {
    e.preventDefault();
    try {
      if (!formExercicio.exercicio_id) {
        toast.error("Por favor, selecione um exercício da lista.");
        return;
      }
      await axios.post(`${API_BASE}/modelos-treino/${id}/exercicios`, formExercicio, authHeader());
      toast.success("Exercício adicionado ao modelo!");
      setFormExercicio({ exercicio_id: '', series: '', repeticoes: '', descanso_segundos: '' });
      setAutocompleteValue(null);
      fetchDetalhesModelo();
    } catch (error) {
      toast.error("Falha ao adicionar exercício.");
    }
  };

  const handleRemoveExercicio = async (exercicioDoModeloId) => {
    if (window.confirm("Tem certeza que deseja remover este exercício do modelo?")) {
      try {
        await axios.delete(`${API_BASE}/modelos-treino/exercicios/${exercicioDoModeloId}`, authHeader());
        toast.success("Exercício removido do modelo!");
        fetchDetalhesModelo();
      } catch (error) {
        toast.error("Falha ao remover exercício.");
      }
    }
  };

  if (!modelo) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
        </Box>
    );
  }

  return (
    <Box>
      <Button component={Link} to="/modelos-treino" variant="outlined" sx={{ mb: 2 }}>
        Voltar para a Lista de Modelos
      </Button>
      <Typography variant="h4" component="h1" gutterBottom>
        Editando Modelo: {modelo.nome}
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>{modelo.descricao}</Typography>

      <Paper component="form" onSubmit={handleAddExercicio} sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Adicionar Exercício ao Modelo</Typography>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={5}>
            <Autocomplete
              options={todosExercicios}
              getOptionLabel={(option) => option.nome}
              value={autocompleteValue}
              onChange={(event, newValue) => {
                setAutocompleteValue(newValue);
                setFormExercicio({ ...formExercicio, exercicio_id: newValue ? newValue.id : '' });
              }}
              renderInput={(params) => <TextField {...params} label="Busque um Exercício" variant="standard" required />}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Grid>
          <Grid item xs={6} md={1.5}><TextField name="series" label="Séries" value={formExercicio.series} onChange={handleFormChange} variant="standard" fullWidth required /></Grid>
          <Grid item xs={6} md={1.5}><TextField name="repeticoes" label="Repetições" value={formExercicio.repeticoes} onChange={handleFormChange} variant="standard" fullWidth required /></Grid>
          <Grid item xs={6} md={2}><TextField name="descanso_segundos" label="Descanso (s)" type="number" value={formExercicio.descanso_segundos} onChange={handleFormChange} variant="standard" fullWidth /></Grid>
          <Grid item xs={6} md={2}>
            <Button type="submit" variant="contained" fullWidth>Adicionar</Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Exercício</TableCell>
                <TableCell>Séries</TableCell>
                <TableCell>Repetições</TableCell>
                <TableCell>Descanso</TableCell>
                <TableCell align="right">Ação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {modelo.exercicios.map((ex) => (
                <TableRow key={ex.id}>
                  <TableCell>{ex.nome}</TableCell>
                  <TableCell>{ex.series}</TableCell>
                  <TableCell>{ex.repeticoes}</TableCell>
                  <TableCell>{ex.descanso_segundos ? `${ex.descanso_segundos}s` : ''}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleRemoveExercicio(ex.id)} color="error" title="Remover do Modelo">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default ModeloTreinoDetalhePage;