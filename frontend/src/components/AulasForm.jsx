// frontend/src/components/AulasForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Grid, Paper,
  FormControl, InputLabel, Select, MenuItem, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Snackbar, Alert, CircularProgress
} from '@mui/material';
import { Add, Close } from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ptBR from 'date-fns/locale/pt-BR';
import { format, setHours, setMinutes } from 'date-fns';
import axios from 'axios';
import { API_URL } from '../services/api';

const AulasForm = ({ onAulaAdicionada }) => {
  const token = localStorage.getItem('token');
  
  const [formAberto, setFormAberto] = useState(false);
  const [tiposAula, setTiposAula] = useState([]);
  const [instrutores, setInstrutores] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [alerta, setAlerta] = useState({ aberto: false, tipo: '', mensagem: '' });
  
  const [novoTipoDialogAberto, setNovoTipoDialogAberto] = useState(false);
  const [novoTipo, setNovoTipo] = useState({
    nome: '',
    descricao: '',
    cor: '#3498db',
    duracao_padrao: 60
  });
  
  const [formData, setFormData] = useState({
    tipo_aula_id: '',
    titulo: '',
    descricao: '',
    data: null,
    hora_inicio: null,
    hora_fim: null,
    max_participantes: 20,
    instrutor_id: '',
    sala: '',
    observacoes: ''
  });

  // Carregar tipos de aula
  const carregarTiposAula = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/aulas/tipos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTiposAula(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar tipos de aula:', error);
      mostrarAlerta('error', 'Erro ao carregar tipos de aula');
    }
  };

  // Carregar lista de instrutores
  const carregarInstrutores = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/dashboard/equipe`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInstrutores(response.data.filter(usuario => 
        usuario.papel === 'instrutor' || usuario.papel === 'admin'
      ));
    } catch (error) {
      console.error('Erro ao carregar instrutores:', error);
      mostrarAlerta('error', 'Erro ao carregar lista de instrutores');
    }
  };

  useEffect(() => {
    carregarTiposAula();
    carregarInstrutores();
  }, []);

  // Atualiza o estado do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manipula mudanças nos campos de data e hora
  const handleDateChange = (campo, valor) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
    
    // Se for tipo de aula e tiver duração padrão, ajustar hora fim
    if (campo === 'tipo_aula_id' && valor) {
      const tipoSelecionado = tiposAula.find(tipo => tipo.id === valor);
      
      if (tipoSelecionado?.duracao_padrao && formData.hora_inicio) {
        const horaInicio = formData.hora_inicio;
        const horaFim = new Date(horaInicio);
        horaFim.setMinutes(horaInicio.getMinutes() + tipoSelecionado.duracao_padrao);
        setFormData(prev => ({ ...prev, hora_fim: horaFim }));
      }
    }
    
    // Se for hora de início e tiver tipo de aula selecionado, ajustar hora fim
    if (campo === 'hora_inicio' && valor && formData.tipo_aula_id) {
      const tipoSelecionado = tiposAula.find(tipo => tipo.id === formData.tipo_aula_id);
      
      if (tipoSelecionado?.duracao_padrao) {
        const horaFim = new Date(valor);
        horaFim.setMinutes(valor.getMinutes() + tipoSelecionado.duracao_padrao);
        setFormData(prev => ({ ...prev, hora_fim: horaFim }));
      }
    }
  };

  // Exibir alerta
  const mostrarAlerta = (tipo, mensagem) => {
    setAlerta({ aberto: true, tipo, mensagem });
  };

  // Fechar alerta
  const fecharAlerta = () => {
    setAlerta({ ...alerta, aberto: false });
  };

  // Criar novo tipo de aula
  const criarNovoTipo = async () => {
    if (!novoTipo.nome) {
      mostrarAlerta('error', 'Nome do tipo de aula é obrigatório');
      return;
    }
    
    setCarregando(true);
    try {
      const response = await axios.post(`${API_URL}/api/aulas/tipos`, novoTipo, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      mostrarAlerta('success', 'Tipo de aula criado com sucesso');
      await carregarTiposAula();
      
      setNovoTipoDialogAberto(false);
      setNovoTipo({
        nome: '',
        descricao: '',
        cor: '#3498db',
        duracao_padrao: 60
      });
    } catch (error) {
      console.error('Erro ao criar tipo de aula:', error);
      mostrarAlerta('error', 'Erro ao criar tipo de aula');
    } finally {
      setCarregando(false);
    }
  };

  // Validar e enviar formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    if (!formData.tipo_aula_id || !formData.titulo || !formData.data ||
        !formData.hora_inicio || !formData.hora_fim) {
      mostrarAlerta('error', 'Preencha todos os campos obrigatórios');
      return;
    }
    
    setCarregando(true);
    
    try {
      // Formatar dados para o backend
      const aulaFormatada = {
        ...formData,
        data: format(formData.data, 'yyyy-MM-dd'),
        hora_inicio: format(formData.hora_inicio, 'HH:mm:ss'),
        hora_fim: format(formData.hora_fim, 'HH:mm:ss')
      };
      
      const response = await axios.post(`${API_URL}/api/aulas`, aulaFormatada, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      mostrarAlerta('success', 'Aula agendada com sucesso');
      
      // Resetar formulário
      setFormData({
        tipo_aula_id: '',
        titulo: '',
        descricao: '',
        data: null,
        hora_inicio: null,
        hora_fim: null,
        max_participantes: 20,
        instrutor_id: '',
        sala: '',
        observacoes: ''
      });
      
      setFormAberto(false);
      
      // Notificar componente pai
      if (onAulaAdicionada) {
        onAulaAdicionada();
      }
    } catch (error) {
      console.error('Erro ao agendar aula:', error);
      mostrarAlerta('error', error.response?.data?.message || 'Erro ao agendar aula');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box>
      {!formAberto ? (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => setFormAberto(true)}
            sx={{ mb: 2 }}
          >
            Agendar Nova Aula
          </Button>
        ) : (
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Nova Aula</Typography>
              <IconButton onClick={() => setFormAberto(false)}>
                <Close />
              </IconButton>
            </Box>
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center">
                    <FormControl fullWidth>
                      <InputLabel id="tipo-aula-label">Tipo de Aula*</InputLabel>
                      <Select
                        labelId="tipo-aula-label"
                        name="tipo_aula_id"
                        value={formData.tipo_aula_id}
                        onChange={(e) => handleDateChange('tipo_aula_id', e.target.value)}
                        label="Tipo de Aula*"
                        required
                      >
                        {tiposAula.map((tipo) => (
                          <MenuItem 
                            key={tipo.id} 
                            value={tipo.id}
                            sx={{ 
                              '&.Mui-selected': { bgcolor: `${tipo.cor}22` }
                            }}
                          >
                            <Box display="flex" alignItems="center">
                              <Box 
                                sx={{ 
                                  width: 16, 
                                  height: 16, 
                                  bgcolor: tipo.cor || '#3498db',
                                  borderRadius: '50%',
                                  mr: 1
                                }} 
                              />
                              {tipo.nome}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button 
                      variant="text" 
                      onClick={() => setNovoTipoDialogAberto(true)}
                      sx={{ ml: 1, whiteSpace: 'nowrap' }}
                    >
                      Novo Tipo
                    </Button>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Título*"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="Data*"
                    value={formData.data}
                    onChange={(newValue) => handleDateChange('data', newValue)}
                    slotProps={{
                      textField: { fullWidth: true, required: true }
                    }}
                  />
                </Grid>
                
                <Grid item xs={6} md={2}>
                  <TimePicker
                    label="Início*"
                    value={formData.hora_inicio}
                    onChange={(newValue) => handleDateChange('hora_inicio', newValue)}
                    slotProps={{
                      textField: { fullWidth: true, required: true }
                    }}
                  />
                </Grid>
                
                <Grid item xs={6} md={2}>
                  <TimePicker
                    label="Fim*"
                    value={formData.hora_fim}
                    onChange={(newValue) => handleDateChange('hora_fim', newValue)}
                    slotProps={{
                      textField: { fullWidth: true, required: true }
                    }}
                  />
                </Grid>
                
                <Grid item xs={6} md={2}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Máx. Participantes"
                    name="max_participantes"
                    value={formData.max_participantes}
                    onChange={handleChange}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                
                <Grid item xs={6} md={2}>
                  <TextField
                    fullWidth
                    label="Sala"
                    name="sala"
                    value={formData.sala}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="instrutor-label">Instrutor</InputLabel>
                    <Select
                      labelId="instrutor-label"
                      name="instrutor_id"
                      value={formData.instrutor_id}
                      onChange={handleChange}
                      label="Instrutor"
                    >
                      <MenuItem value="">Selecione um instrutor</MenuItem>
                      {instrutores.map((instrutor) => (
                        <MenuItem key={instrutor.id} value={instrutor.id}>
                          {instrutor.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Descrição"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    multiline
                    rows={2}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observações"
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleChange}
                    multiline
                    rows={2}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button 
                      variant="outlined" 
                      onClick={() => setFormAberto(false)}
                      disabled={carregando}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      variant="contained"
                      disabled={carregando}
                      startIcon={carregando ? <CircularProgress size={20} /> : null}
                    >
                      {carregando ? 'Agendando...' : 'Agendar Aula'}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </form>
          </Paper>
        )}
      </Box>
      
      {/* Dialog para criar novo tipo de aula */}
      <Dialog 
        open={novoTipoDialogAberto} 
        onClose={() => setNovoTipoDialogAberto(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Novo Tipo de Aula
          <IconButton
            aria-label="close"
            onClick={() => setNovoTipoDialogAberto(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome*"
                value={novoTipo.nome}
                onChange={(e) => setNovoTipo({ ...novoTipo, nome: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cor"
                type="color"
                value={novoTipo.cor}
                onChange={(e) => setNovoTipo({ ...novoTipo, cor: e.target.value })}
                sx={{ '& input': { height: 40 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duração Padrão (min)"
                type="number"
                value={novoTipo.duracao_padrao}
                onChange={(e) => setNovoTipo({ ...novoTipo, duracao_padrao: e.target.value })}
                inputProps={{ min: 15, step: 5 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                value={novoTipo.descricao}
                onChange={(e) => setNovoTipo({ ...novoTipo, descricao: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setNovoTipoDialogAberto(false)}
            disabled={carregando}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={criarNovoTipo}
            disabled={carregando}
            startIcon={carregando ? <CircularProgress size={20} /> : null}
          >
            {carregando ? 'Criando...' : 'Criar Tipo'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Alerta para feedback */}
      <Snackbar 
        open={alerta.aberto} 
        autoHideDuration={6000} 
        onClose={fecharAlerta}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
          <Alert onClose={fecharAlerta} severity={alerta.tipo} sx={{ width: '100%' }}>
            {alerta.mensagem}
          </Alert>
        </Snackbar>
      </LocalizationProvider>
    );
};

export default AulasForm;