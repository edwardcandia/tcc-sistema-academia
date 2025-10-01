// frontend/src/pages/ModelosTreinoPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, Box, Accordion, AccordionSummary, AccordionDetails, 
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Button, IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';

function ModelosTreinoPage() {
  const [modelos, setModelos] = useState([]);
  const [formData, setFormData] = useState({ nome: '', descricao: '' });
  const { authHeader } = useAuth();
  const navigate = useNavigate();

  const fetchModelos = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/modelos-treino', authHeader());
      setModelos(response.data);
    } catch (error) {
      toast.error("Falha ao carregar modelos de treino.");
    }
  };

  useEffect(() => {
    if (authHeader) fetchModelos();
  }, [authHeader]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/modelos-treino', formData, authHeader());
      toast.success("Modelo de treino criado com sucesso!");
      setFormData({ nome: '', descricao: '' });
      fetchModelos();
    } catch (error) {
      toast.error(error.response?.data?.error || "Falha ao criar modelo.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este modelo de treino e todos os seus exercícios associados?")) {
      try {
        await axios.delete(`http://localhost:3001/api/modelos-treino/${id}`, authHeader());
        toast.success("Modelo de treino excluído com sucesso!");
        fetchModelos();
      } catch (error) {
        toast.error(error.response?.data?.error || "Falha ao excluir modelo.");
      }
    }
  };

  const handleEdit = (id) => {
    // Navega para a página de detalhes para edição, que criaremos a seguir
    navigate(`/modelos-treino/${id}`);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>Gerenciar Modelos de Treino</Typography>
      
      <Accordion defaultExpanded sx={{ mb: 4 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Criar Novo Modelo de Treino</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField name="nome" label="Nome do Modelo (ex: Treino A, Full Body)" value={formData.nome} onChange={handleChange} required />
            <TextField name="descricao" label="Descrição (Opcional)" value={formData.descricao} onChange={handleChange} multiline rows={2} />
            <Box>
              <Button type="submit" variant="contained">Criar Modelo</Button>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome do Modelo</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {modelos.map((modelo) => (
                <TableRow key={modelo.id}>
                  <TableCell>{modelo.nome}</TableCell>
                  <TableCell>{modelo.descricao}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(modelo.id)} color="primary" title="Editar / Ver Exercícios">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(modelo.id)} color="error"><DeleteIcon /></IconButton>
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

export default ModelosTreinoPage;