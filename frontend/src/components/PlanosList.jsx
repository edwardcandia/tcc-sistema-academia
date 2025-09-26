// frontend/src/components/PlanosList.jsx
import React, { useState } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, TextField, Button, Box, Typography, Modal
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

// Estilo para o Modal (pop-up)
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
  display: 'flex',
  flexDirection: 'column',
  gap: 2
};

function PlanosList({ planos, onPlanoExcluido, onPlanoAtualizado }) {
  const { authHeader } = useAuth();
  
  // Estados para o Modal de Edição
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [planoParaEditar, setPlanoParaEditar] = useState(null);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este plano?')) {
      try {
        await axios.delete(`http://localhost:3001/api/planos/${id}`, authHeader());
        toast.success('Plano excluído com sucesso!');
        onPlanoExcluido();
      } catch (error) {
        if (error.response && error.response.status === 409) {
          toast.error(error.response.data.error);
        } else {
          toast.error('Falha ao excluir o plano.');
        }
      }
    }
  };

  // Funções para controlar o Modal de Edição
  const handleOpenEditModal = (plano) => {
    setPlanoParaEditar(plano);
    setEditModalOpen(true);
  };
  const handleCloseEditModal = () => setEditModalOpen(false);

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setPlanoParaEditar({ ...planoParaEditar, [name]: value });
  };

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.put(`http://localhost:3001/api/planos/${planoParaEditar.id}`, planoParaEditar, authHeader());
      toast.success('Plano atualizado com sucesso!');
      onPlanoAtualizado();
      handleCloseEditModal();
    } catch (error) {
      toast.error('Falha ao atualizar o plano.');
    }
  };

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>Lista de Planos</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {planos.map(plano => (
              <TableRow key={plano.id}>
                <TableCell>{plano.nome}</TableCell>
                <TableCell>R$ {plano.valor}</TableCell>
                <TableCell>{plano.descricao}</TableCell>
                <TableCell align="right">
                  <IconButton type="button" onClick={() => handleOpenEditModal(plano)} color="primary"><EditIcon /></IconButton>
                  <IconButton type="button" onClick={() => handleDelete(plano.id)} color="error"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* --- MODAL DE EDIÇÃO DE PLANO --- */}
      {planoParaEditar && (
        <Modal open={editModalOpen} onClose={handleCloseEditModal}>
          <Box sx={styleModal} component="form" onSubmit={handleUpdateSubmit}>
            <Typography variant="h6" component="h2">Editar Plano</Typography>
            <TextField label="Nome do Plano" name="nome" value={planoParaEditar.nome} onChange={handleEditFormChange} fullWidth required />
            <TextField label="Valor (R$)" name="valor" type="number" value={planoParaEditar.valor} onChange={handleEditFormChange} fullWidth required />
            <TextField label="Descrição" name="descricao" value={planoParaEditar.descricao} onChange={handleEditFormChange} fullWidth multiline rows={2} />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={handleCloseEditModal}>Cancelar</Button>
              <Button type="submit" variant="contained">Salvar Alterações</Button>
            </Box>
          </Box>
        </Modal>
      )}
    </>
  );
}

export default PlanosList;