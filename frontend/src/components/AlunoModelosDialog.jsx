// frontend/src/components/AlunoModelosDialog.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box,
  Select, MenuItem, FormControl, InputLabel, TextField, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../services/api';

function AlunoModelosDialog({ open, onClose, aluno }) {
  const { authHeader } = useAuth();
  const [modelos, setModelos] = useState([]);
  const [modelosAssociados, setModelosAssociados] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedModelo, setSelectedModelo] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (open && aluno) {
      fetchModelos();
      fetchModelosAssociados();
    }
  }, [open, aluno]);

  const fetchModelos = async () => {
    try {
      const response = await axios.get(`${API_BASE}/modelos-treino`, authHeader());
      setModelos(response.data);
    } catch (error) {
      toast.error('Erro ao carregar modelos de treino.');
    }
  };

  const fetchModelosAssociados = async () => {
    try {
      const response = await axios.get(`${API_BASE}/alunos/${aluno.id}/modelos`, authHeader());
      setModelosAssociados(response.data);
    } catch (error) {
      toast.error('Erro ao carregar modelos associados.');
    }
  };

  const handleAssociar = async () => {
    if (!selectedModelo) {
      toast.error('Selecione um modelo de treino.');
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/alunos-modelos`,
        {
          aluno_id: aluno.id,
          modelo_treino_id: selectedModelo,
          data_inicio: dataInicio || null,
          data_fim: dataFim || null,
          observacoes: observacoes || null
        },
        authHeader()
      );
      toast.success('Modelo associado com sucesso!');
      setShowAddForm(false);
      resetForm();
      fetchModelosAssociados();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao associar modelo.');
    }
  };

  const handleRemover = async (associacaoId) => {
    if (window.confirm('Tem certeza que deseja remover esta associação?')) {
      try {
        await axios.delete(`${API_BASE}/alunos-modelos/${associacaoId}`, authHeader());
        toast.success('Associação removida com sucesso!');
        fetchModelosAssociados();
      } catch (error) {
        toast.error('Erro ao remover associação.');
      }
    }
  };

  const handleAtualizarStatus = async (associacaoId, novoStatus) => {
    try {
      await axios.put(
        `${API_BASE}/alunos-modelos/${associacaoId}`,
        { status: novoStatus },
        authHeader()
      );
      toast.success('Status atualizado!');
      fetchModelosAssociados();
    } catch (error) {
      toast.error('Erro ao atualizar status.');
    }
  };

  const resetForm = () => {
    setSelectedModelo('');
    setDataInicio('');
    setDataFim('');
    setObservacoes('');
    setEditingId(null);
  };

  const getStatusChip = (status) => {
    const colors = {
      ativo: 'success',
      concluido: 'default',
      cancelado: 'error'
    };
    return <Chip label={status} color={colors[status] || 'default'} size="small" />;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Modelos de Treino - {aluno?.nome_completo}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {!showAddForm ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowAddForm(true)}
              sx={{ mb: 2 }}
            >
              Associar Novo Modelo
            </Button>
          ) : (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Novo Modelo</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Modelo de Treino</InputLabel>
                  <Select
                    value={selectedModelo}
                    onChange={(e) => setSelectedModelo(e.target.value)}
                    label="Modelo de Treino"
                  >
                    {modelos.map((modelo) => (
                      <MenuItem key={modelo.id} value={modelo.id}>
                        {modelo.nome} {modelo.nivel_dificuldade ? `(${modelo.nivel_dificuldade})` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Data Início"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Data Fim"
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Observações"
                  multiline
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" onClick={handleAssociar}>
                    Associar
                  </Button>
                  <Button variant="outlined" onClick={() => { setShowAddForm(false); resetForm(); }}>
                    Cancelar
                  </Button>
                </Box>
              </Box>
            </Paper>
          )}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Modelo</TableCell>
                  <TableCell>Nível</TableCell>
                  <TableCell>Data Início</TableCell>
                  <TableCell>Data Fim</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {modelosAssociados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Nenhum modelo associado
                    </TableCell>
                  </TableRow>
                ) : (
                  modelosAssociados.map((assoc) => (
                    <TableRow key={assoc.associacao_id}>
                      <TableCell>{assoc.modelo_nome}</TableCell>
                      <TableCell>{assoc.nivel_dificuldade || '-'}</TableCell>
                      <TableCell>{assoc.data_inicio || '-'}</TableCell>
                      <TableCell>{assoc.data_fim || '-'}</TableCell>
                      <TableCell>
                        <Select
                          value={assoc.status}
                          size="small"
                          onChange={(e) => handleAtualizarStatus(assoc.associacao_id, e.target.value)}
                        >
                          <MenuItem value="ativo">Ativo</MenuItem>
                          <MenuItem value="concluido">Concluído</MenuItem>
                          <MenuItem value="cancelado">Cancelado</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemover(assoc.associacao_id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}

export default AlunoModelosDialog;
