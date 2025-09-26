// frontend/src/components/AlunosList.jsx
import React, { useState } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, TextField, Box, Typography, Select, MenuItem, FormControl, InputLabel,
  Modal, Button, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PaymentIcon from '@mui/icons-material/Payment';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const styleModal = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function AlunosList({ alunos, planos, onAlunoAtualizado, onAlunoExcluido }) {
  const { authHeader } = useAuth();
  const [editingAlunoId, setEditingAlunoId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [valorPago, setValorPago] = useState('');

  const handleOpenModal = (aluno) => {
    setAlunoSelecionado(aluno);
    const planoDoAluno = planos.find(p => p.id === aluno.plano_id);
    setValorPago(planoDoAluno ? planoDoAluno.valor : '');
    setOpenModal(true);
  };
  const handleCloseModal = () => setOpenModal(false);

  const handleSubmitPagamento = async (e) => {
    e.preventDefault();
    try {
      const dataPagamento = {
        valor_pago: parseFloat(valorPago),
        data_pagamento: new Date().toISOString().split('T')[0],
      };
      await axios.post(`http://localhost:3001/api/alunos/${alunoSelecionado.id}/pagamentos`, dataPagamento, authHeader());
      toast.success('Pagamento registrado com sucesso!');
      onAlunoAtualizado(); // Recarrega a lista de alunos
      handleCloseModal();
    } catch (error) {
      toast.error('Falha ao registrar pagamento.');
    }
  };
  
  const handleEditClick = (aluno) => {
    setEditingAlunoId(aluno.id);
    setEditFormData(aluno);
  };
  const handleCancelClick = () => {
    setEditingAlunoId(null);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este aluno?')) {
      try {
        await axios.delete(`http://localhost:3001/api/alunos/${id}`, authHeader());
        toast.success('Aluno excluído com sucesso!');
        onAlunoExcluido();
      } catch (error) {
        toast.error('Falha ao excluir aluno.');
      }
    }
  };
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const dadosParaEnviar = {
      ...editFormData,
      plano_id: parseInt(editFormData.plano_id, 10) || null,
    };
    try {
      await axios.put(`http://localhost:3001/api/alunos/${editingAlunoId}`, dadosParaEnviar, authHeader());
      toast.success('Aluno atualizado com sucesso!');
      setEditingAlunoId(null);
      onAlunoAtualizado();
    } catch (error)      {
      toast.error('Falha ao atualizar aluno.');
    }
  };

  const getStatusColor = (status) => {
    if (status === 'atrasado') return 'error';
    if (status === 'em_dia') return 'success';
    if (status === 'pendente') return 'warning';
    return 'default';
  };
  
  return (
    <>
      <Box component="form" onSubmit={handleUpdateSubmit}>
        <Typography variant="h6" sx={{ mb: 2 }}>Lista de Alunos</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome Completo</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status Pagamento</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alunos.map(aluno => (
                <TableRow key={aluno.id} sx={{ backgroundColor: aluno.status_pagamento === 'atrasado' ? '#ffebee' : 'inherit' }}>
                  {editingAlunoId === aluno.id ? (
                    <>
                      <TableCell><TextField size="small" name="nome_completo" value={editFormData.nome_completo} onChange={handleChange} fullWidth /></TableCell>
                      <TableCell><TextField size="small" type="email" name="email" value={editFormData.email} onChange={handleChange} fullWidth /></TableCell>
                      <TableCell colSpan={1}></TableCell>
                      <TableCell align="right">
                        <IconButton type="submit" color="primary"><SaveIcon /></IconButton>
                        <IconButton type="button" onClick={handleCancelClick}><CancelIcon /></IconButton>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{aluno.nome_completo}</TableCell>
                      <TableCell>{aluno.email}</TableCell>
                      <TableCell>
                        <Chip label={aluno.status_pagamento.replace('_', ' ')} color={getStatusColor(aluno.status_pagamento)} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpenModal(aluno)} color="success" title="Registrar Pagamento"><PaymentIcon /></IconButton>
                        <IconButton type="button" onClick={() => handleEditClick(aluno)} color="primary" title="Editar Aluno"><EditIcon /></IconButton>
                        <IconButton type="button" onClick={() => handleDelete(aluno.id)} color="error" title="Excluir Aluno"><DeleteIcon /></IconButton>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={styleModal} component="form" onSubmit={handleSubmitPagamento}>
          <Typography variant="h6" component="h2">Registrar Pagamento para {alunoSelecionado?.nome_completo}</Typography>
          <TextField
            label="Valor a Pagar (R$)" type="number" value={valorPago} onChange={(e) => setValorPago(e.target.value)}
            fullWidth required sx={{ mt: 2 }}
          />
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={handleCloseModal} variant="text">Cancelar</Button>
            <Button type="submit" variant="contained">Confirmar Pagamento</Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

export default AlunosList;