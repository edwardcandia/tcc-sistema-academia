// frontend/src/pages/ExerciciosPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Typography, Box, Accordion, AccordionSummary, AccordionDetails, 
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Button, IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';

function ExerciciosPage() {
  const [exercicios, setExercicios] = useState([]);
  const [formData, setFormData] = useState({ nome: '', grupo_muscular: '', link_video: '' });
  const [editId, setEditId] = useState(null); // Controla se estamos a editar ou a criar
  const { authHeader } = useAuth();

  const fetchExercicios = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/exercicios', authHeader());
      setExercicios(response.data);
    } catch (error) {
      toast.error("Falha ao carregar exercícios.");
    }
  };

  useEffect(() => {
    if (authHeader) fetchExercicios();
  }, [authHeader]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { // Se estiver a editar
        await axios.put(`http://localhost:3001/api/exercicios/${editId}`, formData, authHeader());
        toast.success("Exercício atualizado com sucesso!");
      } else { // Se estiver a criar
        await axios.post('http://localhost:3001/api/exercicios', formData, authHeader());
        toast.success("Exercício criado com sucesso!");
      }
      resetForm();
      fetchExercicios();
    } catch (error) {
      toast.error(error.response?.data?.error || "Falha ao salvar exercício.");
    }
  };

  const handleEdit = (exercicio) => {
    setEditId(exercicio.id);
    setFormData(exercicio);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem a certeza de que deseja excluir este exercício?")) {
      try {
        await axios.delete(`http://localhost:3001/api/exercicios/${id}`, authHeader());
        toast.success("Exercício excluído com sucesso!");
        fetchExercicios();
      } catch (error) {
        toast.error(error.response?.data?.error || "Falha ao excluir exercício.");
      }
    }
  };

  const resetForm = () => {
    setEditId(null);
    setFormData({ nome: '', grupo_muscular: '', link_video: '' });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>Gerenciar Exercícios</Typography>
      
      <Accordion defaultExpanded sx={{ mb: 4 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">{editId ? "Editando Exercício" : "Cadastrar Novo Exercício"}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField name="nome" label="Nome do Exercício" value={formData.nome} onChange={handleChange} required />
            <TextField name="grupo_muscular" label="Grupo Muscular" value={formData.grupo_muscular} onChange={handleChange} required />
            <TextField name="link_video" label="Link do Vídeo (Opcional)" value={formData.link_video} onChange={handleChange} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button type="submit" variant="contained">{editId ? "Salvar Alterações" : "Cadastrar"}</Button>
              {editId && <Button variant="outlined" onClick={resetForm}>Cancelar Edição</Button>}
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Paper>
        <Typography variant="h6" sx={{ p: 2 }}>Biblioteca de Exercícios</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Grupo Muscular</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exercicios.map((ex) => (
                <TableRow key={ex.id}>
                  <TableCell>{ex.nome}</TableCell>
                  <TableCell>{ex.grupo_muscular}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(ex)} color="primary"><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(ex.id)} color="error"><DeleteIcon /></IconButton>
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

export default ExerciciosPage;