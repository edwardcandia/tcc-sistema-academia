// frontend/src/components/PlanosList.jsx
import React, { useState } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, TextField, Button, Box, Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext'; // Importar useAuth

function PlanosList({ planos, onPlanoExcluido, onPlanoAtualizado }) {
  const { authHeader } = useAuth(); // Obter o authHeader
  const [editingPlanoId, setEditingPlanoId] = useState(null);
  const [editFormData, setEditFormData] = useState({ nome: '', valor: '', descricao: '' });

  // --- FUNÇÃO DE DELETAR ATUALIZADA ---
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este plano?')) {
      try {
        await axios.delete(`http://localhost:3001/api/planos/${id}`, authHeader());
        toast.success('Plano excluído com sucesso!');
        onPlanoExcluido();
      } catch (error) {
        // Captura o erro específico do backend e mostra a mensagem dele
        if (error.response && error.response.status === 409) {
          toast.error(error.response.data.error);
        } else {
          toast.error('Falha ao excluir o plano.');
        }
        console.error('Erro ao excluir plano:', error);
      }
    }
  };

  const handleEditClick = (plano) => {
    setEditingPlanoId(plano.id);
    setEditFormData({ ...plano });
  };

  const handleCancelClick = () => {
    setEditingPlanoId(null);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.put(`http://localhost:3001/api/planos/${editingPlanoId}`, editFormData, authHeader());
      toast.success('Plano atualizado com sucesso!');
      setEditingPlanoId(null);
      onPlanoAtualizado();
    } catch (error) {
      toast.error('Falha ao atualizar o plano.');
    }
  };

  return (
    <Box component="form" onSubmit={handleUpdateSubmit}>
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
                {editingPlanoId === plano.id ? (
                  <>
                    <TableCell><TextField size="small" name="nome" value={editFormData.nome} onChange={handleFormChange} fullWidth /></TableCell>
                    <TableCell><TextField size="small" type="number" name="valor" value={editFormData.valor} onChange={handleFormChange} fullWidth /></TableCell>
                    <TableCell><TextField size="small" name="descricao" value={editFormData.descricao} onChange={handleFormChange} fullWidth /></TableCell>
                    <TableCell align="right">
                      <IconButton type="submit" color="primary"><SaveIcon /></IconButton>
                      <IconButton type="button" onClick={handleCancelClick}><CancelIcon /></IconButton>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{plano.nome}</TableCell>
                    <TableCell>R$ {plano.valor}</TableCell>
                    <TableCell>{plano.descricao}</TableCell>
                    <TableCell align="right">
                      <IconButton type="button" onClick={() => handleEditClick(plano)} color="primary"><EditIcon /></IconButton>
                      <IconButton type="button" onClick={() => handleDelete(plano.id)} color="error"><DeleteIcon /></IconButton>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default PlanosList;