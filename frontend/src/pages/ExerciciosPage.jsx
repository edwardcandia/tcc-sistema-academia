// frontend/src/pages/ExerciciosPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Typography, Box, Accordion, AccordionSummary, AccordionDetails, 
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Button, IconButton, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Chip, Grid, FormHelperText, Dialog, DialogContent, Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import FilterListIcon from '@mui/icons-material/FilterList';
import { toast } from 'react-toastify';

// Lista de grupos musculares predefinidos
const GRUPOS_MUSCULARES = [
  'Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 
  'Tríceps', 'Abdômen', 'Glúteos', 'Panturrilha', 'Antebraço', 'Lombar'
];

function ExerciciosPage() {
  const [exercicios, setExercicios] = useState([]);
  const [formData, setFormData] = useState({ 
    nome: '', 
    grupo_muscular: '', 
    link_video: '' 
  });
  const [editId, setEditId] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [erros, setErros] = useState({});
  const [videoDialog, setVideoDialog] = useState({ open: false, url: '' });
  const { authHeader } = useAuth();

  const fetchExercicios = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/exercicios', authHeader());
      setExercicios(response.data);
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error);
      toast.error(error.response?.data?.error || "Falha ao carregar exercícios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authHeader) fetchExercicios();
  }, [authHeader]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Limpar mensagens de erro quando o usuário corrige o campo
    if (erros[name]) {
      setErros(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const novosErros = {};
    
    if (!formData.nome.trim()) {
      novosErros.nome = 'Nome do exercício é obrigatório';
    }
    
    if (!formData.grupo_muscular) {
      novosErros.grupo_muscular = 'Grupo muscular é obrigatório';
    }
    
    if (formData.link_video && !isValidVideoUrl(formData.link_video)) {
      novosErros.link_video = 'URL de vídeo inválida';
    }
    
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };
  
  const isValidVideoUrl = (url) => {
    if (!url) return true; // URL opcional
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return regex.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
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
      console.error('Erro ao salvar exercício:', error);
      toast.error(error.response?.data?.error || "Falha ao salvar exercício.");
      
      // Se o erro for de duplicidade, mostra no campo específico
      if (error.response?.status === 409) {
        setErros({ nome: 'Já existe um exercício com este nome' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (exercicio) => {
    setEditId(exercicio.id);
    setFormData(exercicio);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem a certeza de que deseja excluir este exercício?")) {
      setLoading(true);
      try {
        await axios.delete(`http://localhost:3001/api/exercicios/${id}`, authHeader());
        toast.success("Exercício excluído com sucesso!");
        fetchExercicios();
      } catch (error) {
        console.error('Erro ao excluir exercício:', error);
        toast.error(error.response?.data?.error || "Falha ao excluir exercício.");
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setEditId(null);
    setFormData({ nome: '', grupo_muscular: '', link_video: '' });
    setErros({});
  };
  
  const handleOpenVideo = (url) => {
    if (url) {
      setVideoDialog({ open: true, url });
    } else {
      toast.info("Este exercício não possui vídeo demonstrativo.");
    }
  };
  
  const handleCloseVideo = () => {
    setVideoDialog({ open: false, url: '' });
  };
  
  // Filtrar exercícios por grupo muscular
  const exerciciosFiltrados = filtroGrupo 
    ? exercicios.filter(ex => ex.grupo_muscular === filtroGrupo)
    : exercicios;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>Gerenciar Exercícios</Typography>
      
      {/* Formulário para criar/editar exercícios */}
      <Accordion defaultExpanded sx={{ mb: 4 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">{editId ? "Editando Exercício" : "Cadastrar Novo Exercício"}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="nome"
              label="Nome do Exercício"
              value={formData.nome}
              onChange={handleChange}
              required
              error={Boolean(erros.nome)}
              helperText={erros.nome}
              disabled={loading}
            />
            
            <FormControl required error={Boolean(erros.grupo_muscular)} disabled={loading}>
              <InputLabel>Grupo Muscular</InputLabel>
              <Select
                name="grupo_muscular"
                value={formData.grupo_muscular}
                onChange={handleChange}
                label="Grupo Muscular"
              >
                {GRUPOS_MUSCULARES.map((grupo) => (
                  <MenuItem key={grupo} value={grupo}>{grupo}</MenuItem>
                ))}
              </Select>
              {erros.grupo_muscular && <FormHelperText>{erros.grupo_muscular}</FormHelperText>}
            </FormControl>
            
            <TextField
              name="link_video"
              label="Link do Vídeo do YouTube (Opcional)"
              value={formData.link_video || ''}
              onChange={handleChange}
              error={Boolean(erros.link_video)}
              helperText={erros.link_video || "Ex: https://www.youtube.com/watch?v=exemplo"}
              disabled={loading}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : (editId ? "Salvar Alterações" : "Cadastrar")}
              </Button>
              {editId && <Button variant="outlined" onClick={resetForm} disabled={loading}>Cancelar Edição</Button>}
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Filtros e lista de exercícios */}
      <Paper sx={{ mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <FilterListIcon />
          <FormControl variant="outlined" sx={{ minWidth: 200 }} size="small">
            <InputLabel>Filtrar por Grupo Muscular</InputLabel>
            <Select
              value={filtroGrupo}
              onChange={(e) => setFiltroGrupo(e.target.value)}
              label="Filtrar por Grupo Muscular"
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {GRUPOS_MUSCULARES.map((grupo) => (
                <MenuItem key={grupo} value={grupo}>{grupo}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {filtroGrupo && (
            <Chip 
              label={`Filtro: ${filtroGrupo}`} 
              onDelete={() => setFiltroGrupo('')} 
              color="primary" 
              variant="outlined" 
            />
          )}
        </Box>
      </Paper>

      {loading && !exerciciosFiltrados.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
          <Typography variant="h6" sx={{ p: 2 }}>
            Biblioteca de Exercícios
            {filtroGrupo && ` - ${filtroGrupo}`}
            <Typography component="span" sx={{ ml: 1, color: 'text.secondary' }}>
              ({exerciciosFiltrados.length} {exerciciosFiltrados.length === 1 ? 'exercício' : 'exercícios'})
            </Typography>
          </Typography>
          
          {!exerciciosFiltrados.length ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              {filtroGrupo ? (
                <Typography>Nenhum exercício encontrado para o grupo muscular "{filtroGrupo}".</Typography>
              ) : (
                <Typography>Nenhum exercício cadastrado. Adicione o primeiro usando o formulário acima.</Typography>
              )}
            </Box>
          ) : (
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
                  {exerciciosFiltrados.map((ex) => (
                    <TableRow key={ex.id}>
                      <TableCell>{ex.nome}</TableCell>
                      <TableCell>
                        <Chip 
                          label={ex.grupo_muscular} 
                          size="small" 
                          variant="outlined" 
                          color="primary"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {ex.link_video && (
                          <Tooltip title="Ver vídeo demonstrativo">
                            <IconButton 
                              onClick={() => handleOpenVideo(ex.link_video)} 
                              color="info"
                            >
                              <VideoLibraryIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Editar exercício">
                          <IconButton 
                            onClick={() => handleEdit(ex)} 
                            color="primary"
                            disabled={loading}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir exercício">
                          <IconButton 
                            onClick={() => handleDelete(ex.id)} 
                            color="error"
                            disabled={loading}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* Dialog para exibir vídeo */}
      <Dialog 
        open={videoDialog.open} 
        onClose={handleCloseVideo} 
        maxWidth="md" 
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          {videoDialog.url && (
            <iframe
              src={videoDialog.url.replace('watch?v=', 'embed/')}
              width="100%"
              height="480"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Vídeo de demonstração"
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default ExerciciosPage;