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
import { API_BASE } from '../services/api';
import { toast } from 'react-toastify';

// Lista de grupos musculares predefinidos
const GRUPOS_MUSCULARES = [
  'Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 
  'Tríceps', 'Abdômen', 'Glúteos', 'Panturrilha', 'Antebraço', 'Lombar'
];

// Validar URL de vídeo do YouTube
const isValidYoutubeUrl = (url) => {
  if (!url) return true; // URL é opcional
  const regex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/).+/;
  return regex.test(url);
};

// Função para transformar URL do YouTube em URL de incorporação
const transformYouTubeUrl = (url) => {
  if (!url) return '';
  
  // Detecta diferentes formatos de URL do YouTube e extrai o ID do vídeo
  let videoId;
  
  // Formato: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/);
  if (watchMatch) {
    videoId = watchMatch[1];
  }
  
  // Formato: https://youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) {
    videoId = shortMatch[1];
  }
  
  if (videoId) {
    // Retorna URL de incorporação com parâmetros otimizados
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`;
  }
  
  // Se não conseguiu extrair o ID, tenta o método simples de substituição
  return url.replace('watch?v=', 'embed/');
};

function ExerciciosPage() {
  const [exercicios, setExercicios] = useState([]);
  const [formData, setFormData] = useState({ 
    nome: '', 
    descricao: '',
    grupo_muscular: '', 
    nivel_dificuldade: 'iniciante',
    link_video: '',
    imagem_url: '',
    instrucoes: '' 
  });
  const [editId, setEditId] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [erros, setErros] = useState({});
  const [videoDialog, setVideoDialog] = useState({ open: false, url: '' });
  const [imageDialog, setImageDialog] = useState({ open: false, url: '' });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });
  const { authHeader } = useAuth();

  const fetchExercicios = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      // Constrói os parâmetros da consulta
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      
      // Adiciona filtros se existirem
      if (filtroGrupo) {
        params.append('grupo', filtroGrupo);
      }
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      const response = await axios.get(
        `${API_BASE}/exercicios?${params.toString()}`, 
        authHeader()
      );
      
      setExercicios(response.data.exercicios);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error);
      toast.error(error.response?.data?.error || "Falha ao carregar exercícios.");
    } finally {
      setLoading(false);
    }
  };
  
  // Controle de paginação
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchExercicios(newPage, pagination.limit);
    }
  };

  useEffect(() => {
    if (authHeader) fetchExercicios(1, 10);
  }, [authHeader]);
  
  // Quando mudam os filtros, reinicia a paginação
  useEffect(() => {
    if (authHeader) fetchExercicios(1, pagination.limit);
  }, [filtroGrupo, searchTerm]);

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
    
    if (formData.link_video && !isValidYoutubeUrl(formData.link_video)) {
      novosErros.link_video = 'URL de vídeo inválida. Deve ser uma URL válida do YouTube';
    }
    
    if (formData.imagem_url && !isValidImageUrl(formData.imagem_url)) {
      novosErros.imagem_url = 'URL de imagem inválida. Deve terminar com .jpg, .jpeg, .png ou .gif';
    }
    
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };
  
  const isValidImageUrl = (url) => {
    if (!url) return true; // URL opcional
    const regex = /\.(jpg|jpeg|png|gif)$/i;
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
        await axios.put(`${API_BASE}/exercicios/${editId}`, formData, authHeader());
        toast.success("Exercício atualizado com sucesso!");
      } else { // Se estiver a criar
        await axios.post(`${API_BASE}/exercicios`, formData, authHeader());
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
        await axios.delete(`${API_BASE}/exercicios/${id}`, authHeader());
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
    setFormData({ 
      nome: '', 
      descricao: '',
      grupo_muscular: '', 
      nivel_dificuldade: 'iniciante',
      link_video: '',
      imagem_url: '',
      instrucoes: ''
    });
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
  
  const handleOpenImage = (url) => {
    if (url) {
      setImageDialog({ open: true, url });
    } else {
      toast.info("Este exercício não possui imagem.");
    }
  };
  
  const handleCloseImage = () => {
    setImageDialog({ open: false, url: '' });
  };
  
  // Não precisamos mais filtrar manualmente, pois o backend já retorna filtrado

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
            
            <TextField
              name="imagem_url"
              label="URL da Imagem (Opcional)"
              value={formData.imagem_url || ''}
              onChange={handleChange}
              error={Boolean(erros.imagem_url)}
              helperText={erros.imagem_url || "URL da imagem (formatos .jpg, .jpeg, .png, .gif)"}
              disabled={loading}
              fullWidth
            />
            
            <TextField
              name="instrucoes"
              label="Instruções de Execução (Opcional)"
              value={formData.instrucoes || ''}
              onChange={handleChange}
              multiline
              rows={3}
              disabled={loading}
              fullWidth
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

      {/* Filtros e pesquisa de exercícios */}
      <Paper sx={{ mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
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
          
          <TextField 
            label="Buscar por nome" 
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 200 }}
            InputProps={{
              endAdornment: searchTerm && (
                <IconButton 
                  size="small" 
                  onClick={() => setSearchTerm('')}
                  aria-label="limpar busca"
                >
                  &times;
                </IconButton>
              )
            }}
          />
          
          {filtroGrupo && (
            <Chip 
              label={`Grupo: ${filtroGrupo}`} 
              onDelete={() => setFiltroGrupo('')} 
              color="primary" 
              variant="outlined" 
            />
          )}
          
          {searchTerm && (
            <Chip 
              label={`Busca: ${searchTerm}`} 
              onDelete={() => setSearchTerm('')} 
              color="secondary" 
              variant="outlined" 
            />
          )}
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
          <Typography variant="h6" sx={{ p: 2 }}>
            Biblioteca de Exercícios
            {filtroGrupo && ` - ${filtroGrupo}`}
            {searchTerm && ` - Busca: "${searchTerm}"`}
            <Typography component="span" sx={{ ml: 1, color: 'text.secondary' }}>
              ({pagination.total} {pagination.total === 1 ? 'exercício' : 'exercícios'})
            </Typography>
          </Typography>
          
          {!exercicios.length ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              {filtroGrupo || searchTerm ? (
                <Typography>Nenhum exercício encontrado com os filtros aplicados.</Typography>
              ) : (
                <Typography>Nenhum exercício cadastrado. Adicione o primeiro usando o formulário acima.</Typography>
              )}
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>Grupo Muscular</TableCell>
                      <TableCell>Imagem</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {exercicios.map((ex) => (
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
                      <TableCell>
                        {ex.imagem_url && (
                          <Tooltip title="Ver imagem">
                            <Box 
                              component="img" 
                              src={ex.imagem_url}
                              alt={`Imagem de ${ex.nome}`}
                              sx={{ 
                                height: 40, 
                                width: 'auto', 
                                maxWidth: 60, 
                                objectFit: 'contain',
                                cursor: 'pointer'
                              }}
                              onClick={() => handleOpenImage(ex.imagem_url)}
                            />
                          </Tooltip>
                        )}
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
            
            {/* Controles de Paginação */}
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  disabled={loading || pagination.currentPage <= 1}
                  onClick={() => handlePageChange(1)}
                >
                  «
                </Button>
                <Button
                  variant="outlined"
                  disabled={loading || !pagination.hasPrevPage}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  ‹
                </Button>
                
                <Typography>
                  Página {pagination.currentPage} de {pagination.totalPages}
                </Typography>
                
                <Button
                  variant="outlined"
                  disabled={loading || !pagination.hasNextPage}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  ›
                </Button>
                <Button
                  variant="outlined"
                  disabled={loading || pagination.currentPage >= pagination.totalPages}
                  onClick={() => handlePageChange(pagination.totalPages)}
                >
                  »
                </Button>
              </Box>
            </Box>
          </>
          )}
        </Paper>
      )}

      {/* Dialog para exibir vídeo com mais opções */}
      <Dialog 
        open={videoDialog.open} 
        onClose={handleCloseVideo} 
        maxWidth="md" 
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {videoDialog.url && (
            <>
              {/* Barra superior com título e botões */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                p: 1, 
                bgcolor: 'rgba(0,0,0,0.8)',
                color: 'white'
              }}>
                <Typography variant="subtitle1">
                  Vídeo Demonstrativo
                </Typography>
                <Box>
                  <Tooltip title="Abrir no YouTube">
                    <IconButton 
                      size="small" 
                      color="inherit" 
                      onClick={() => window.open(videoDialog.url, '_blank')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M10,15L15.19,12L10,9V15M21.56,7.17C21.69,7.64 21.78,8.27 21.84,9.07C21.91,9.87 21.94,10.56 21.94,11.16L22,12C22,14.19 21.84,15.8 21.56,16.83C21.31,17.73 20.73,18.31 19.83,18.56C19.36,18.69 18.5,18.78 17.18,18.84C15.88,18.91 14.69,18.94 13.59,18.94L12,19C7.81,19 5.2,18.84 4.17,18.56C3.27,18.31 2.69,17.73 2.44,16.83C2.31,16.36 2.22,15.73 2.16,14.93C2.09,14.13 2.06,13.44 2.06,12.84L2,12C2,9.81 2.16,8.2 2.44,7.17C2.69,6.27 3.27,5.69 4.17,5.44C4.64,5.31 5.5,5.22 6.82,5.16C8.12,5.09 9.31,5.06 10.41,5.06L12,5C16.19,5 18.8,5.16 19.83,5.44C20.73,5.69 21.31,6.27 21.56,7.17Z" />
                      </svg>
                    </IconButton>
                  </Tooltip>
                  <IconButton size="small" color="inherit" onClick={handleCloseVideo}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                    </svg>
                  </IconButton>
                </Box>
              </Box>
              
              {/* Vídeo incorporado */}
              <iframe
                src={transformYouTubeUrl(videoDialog.url)}
                width="100%"
                height="480"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Vídeo de demonstração"
              />
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialog para exibir imagem */}
      <Dialog 
        open={imageDialog.open} 
        onClose={handleCloseImage} 
        maxWidth="md" 
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {imageDialog.url && (
            <>
              {/* Barra superior com título e botões */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                p: 1, 
                bgcolor: 'rgba(0,0,0,0.8)',
                color: 'white'
              }}>
                <Typography variant="subtitle1">
                  Imagem do Exercício
                </Typography>
                <Box>
                  <Tooltip title="Abrir em nova aba">
                    <IconButton 
                      size="small" 
                      color="inherit" 
                      onClick={() => window.open(imageDialog.url, '_blank')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" />
                      </svg>
                    </IconButton>
                  </Tooltip>
                  <IconButton size="small" color="inherit" onClick={handleCloseImage}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                    </svg>
                  </IconButton>
                </Box>
              </Box>
              
              {/* Imagem */}
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: '#f5f5f5',
                p: 2
              }}>
                <img
                  src={imageDialog.url}
                  alt="Imagem do exercício"
                  style={{ 
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    objectFit: 'contain'
                  }}
                />
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default ExerciciosPage;