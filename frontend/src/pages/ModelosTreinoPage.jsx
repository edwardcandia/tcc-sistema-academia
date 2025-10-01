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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { toast } from 'react-toastify';

function ModelosTreinoPage() {
  const [modelos, setModelos] = useState([]);
  const [formData, setFormData] = useState({ nome: '', descricao: '' });
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [duplicateFormData, setDuplicateFormData] = useState({ nome: '', descricao: '' });
  const [selectedModeloId, setSelectedModeloId] = useState(null);
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
    // Navega para a página de detalhes para edição
    navigate(`/modelos-treino/${id}`);
  };
  
  const handleDuplicateDialog = (modelo) => {
    setSelectedModeloId(modelo.id);
    setDuplicateFormData({ 
      nome: `Cópia de ${modelo.nome}`, 
      descricao: modelo.descricao 
    });
    setDuplicateDialogOpen(true);
  };
  
  const handleDuplicate = async () => {
    try {
      await axios.post(
        `http://localhost:3001/api/modelos-treino/${selectedModeloId}/duplicar`, 
        duplicateFormData, 
        authHeader()
      );
      toast.success("Modelo de treino duplicado com sucesso!");
      setDuplicateDialogOpen(false);
      fetchModelos();
    } catch (error) {
      toast.error(error.response?.data?.error || "Falha ao duplicar modelo.");
    }
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
                    <IconButton 
                      onClick={() => handleEdit(modelo.id)} 
                      color="primary" 
                      title="Editar / Ver Exercícios"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDuplicateDialog(modelo)} 
                      color="info" 
                      title="Duplicar Modelo"
                    >
                      <ContentCopyIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(modelo.id)} 
                      color="error" 
                      title="Excluir Modelo"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Dialog de duplicação de modelo */}
      <Dialog open={duplicateDialogOpen} onClose={() => setDuplicateDialogOpen(false)}>
        <DialogTitle>Duplicar Modelo de Treino</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="nome"
            label="Nome do Novo Modelo"
            type="text"
            fullWidth
            variant="outlined"
            value={duplicateFormData.nome}
            onChange={(e) => setDuplicateFormData({...duplicateFormData, nome: e.target.value})}
          />
          <TextField
            margin="dense"
            name="descricao"
            label="Descrição (Opcional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={2}
            value={duplicateFormData.descricao}
            onChange={(e) => setDuplicateFormData({...duplicateFormData, descricao: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDuplicateDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDuplicate} variant="contained">Duplicar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ModelosTreinoPage;