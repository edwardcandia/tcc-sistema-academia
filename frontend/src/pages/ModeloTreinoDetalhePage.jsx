
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useParams, Link } from 'react-router-dom';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, TextField, Grid, Autocomplete, CircularProgress,
  Chip, Card, CardContent, Divider, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import VisibilityIcon from '@mui/icons-material/Visibility';
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
      const response = await axios.get(`${API_BASE}/exercicios?limit=100`, authHeader());
      setTodosExercicios(response.data.exercicios || []);
    } catch (error) {
      toast.error("Falha ao carregar a biblioteca de exercícios.");
      setTodosExercicios([]);
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
      <Typography variant="body1" sx={{ mb: 2 }}>{modelo.descricao}</Typography>

      {/* Card de Resumo */}
      <Card sx={{ mb: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <FitnessCenterIcon sx={{ fontSize: 40 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6">
                Total de Exercícios: {Array.isArray(modelo.exercicios) ? modelo.exercicios.length : 0}
              </Typography>
              <Typography variant="body2">
                {Array.isArray(modelo.exercicios) && modelo.exercicios.length > 0
                  ? 'Modelo de treino completo e pronto para ser usado'
                  : 'Adicione exercícios ao modelo para começar'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Visualização dos Exercícios Associados */}
      {Array.isArray(modelo.exercicios) && modelo.exercicios.length > 0 && (
        <Accordion defaultExpanded sx={{ mb: 4 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VisibilityIcon />
              <Typography variant="h6">
                Exercícios do Modelo ({modelo.exercicios.length})
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Exercício</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Grupo Muscular</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Séries</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Repetições</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Descanso</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Ação</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {modelo.exercicios.map((ex, index) => (
                    <TableRow key={ex.id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight={500}>
                          {ex.nome}
                        </Typography>
                        {ex.observacoes && (
                          <Typography variant="caption" color="text.secondary">
                            {ex.observacoes}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={ex.grupo_muscular || 'N/A'} 
                          size="small" 
                          color="secondary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={`${ex.series}x`} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip label={ex.repeticoes} size="small" color="primary" />
                      </TableCell>
                      <TableCell>
                        {ex.descanso_segundos ? (
                          <Chip label={`${ex.descanso_segundos}s`} size="small" color="info" />
                        ) : (
                          <Typography variant="caption" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          onClick={() => handleRemoveExercicio(ex.id)} 
                          color="error" 
                          title="Remover do Modelo"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      )}

      <Divider sx={{ my: 4 }} />

      <Paper component="form" onSubmit={handleAddExercicio} sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Adicionar Exercício ao Modelo</Typography>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={5}>
            <Autocomplete
              options={Array.isArray(todosExercicios) ? todosExercicios : []}
              getOptionLabel={(option) => option.nome || ''}
              value={autocompleteValue}
              onChange={(event, newValue) => {
                setAutocompleteValue(newValue);
                setFormExercicio({ ...formExercicio, exercicio_id: newValue ? newValue.id : '' });
              }}
              renderInput={(params) => <TextField {...params} label="Busque um Exercício" variant="standard" required />}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Grid>
          <Grid item xs={6} md={1.5}>
            <TextField name="series" label="Séries" value={formExercicio.series} onChange={handleFormChange} variant="standard" fullWidth required />
          </Grid>
          <Grid item xs={6} md={1.5}>
            <TextField name="repeticoes" label="Repetições" value={formExercicio.repeticoes} onChange={handleFormChange} variant="standard" fullWidth required />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField name="descanso_segundos" label="Descanso (s)" type="number" value={formExercicio.descanso_segundos} onChange={handleFormChange} variant="standard" fullWidth />
          </Grid>
          <Grid item xs={6} md={2}>
            <Button type="submit" variant="contained" fullWidth>Adicionar</Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Mensagem quando não há exercícios */}
      {(!Array.isArray(modelo.exercicios) || modelo.exercicios.length === 0) && (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <FitnessCenterIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum exercício adicionado ainda
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use o formulário acima para adicionar exercícios a este modelo de treino
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

export default ModeloTreinoDetalhePage;