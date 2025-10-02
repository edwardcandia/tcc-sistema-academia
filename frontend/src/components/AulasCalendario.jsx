// frontend/src/components/AulasCalendario.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import 'moment/locale/pt-br';
import {
  Box, Typography, Paper, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Grid, IconButton,
  Chip, CircularProgress, Alert
} from '@mui/material';
import { 
  AccessTime, Room, Person, Event, Close,
  CheckCircle, Cancel, Info
} from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../services/api';

// Configurar localização para pt-BR
moment.locale('pt-br');
const localizer = momentLocalizer(moment);

const AulasCalendario = ({ isAluno = false }) => {
  const [eventos, setEventos] = useState([]);
  const [tiposAula, setTiposAula] = useState([]);
  const [aulaSelecionada, setAulaSelecionada] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [inscrito, setInscrito] = useState(false);

  // Token baseado no tipo de usuário
  const token = isAluno 
    ? localStorage.getItem('alunoToken') 
    : localStorage.getItem('token');
  
  // Carregar aulas
  const carregarAulas = async () => {
    setCarregando(true);
    try {
      // Endpoint diferente baseado no tipo de usuário
      const endpoint = isAluno 
        ? `${API_URL}/api/aulas/aluno/minhas-aulas` 
        : `${API_URL}/api/aulas`;
      
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Formatar as aulas para o formato do calendário
      const eventosFormatados = response.data.data.map(aula => {
        const dataAula = moment(aula.data).format('YYYY-MM-DD');
        const inicio = moment(`${dataAula}T${aula.hora_inicio}`).toDate();
        const fim = moment(`${dataAula}T${aula.hora_fim}`).toDate();
        
        return {
          id: aula.id,
          title: aula.titulo,
          start: inicio,
          end: fim,
          tipo: aula.tipo_aula_nome,
          status: aula.status,
          statusInscricao: aula.status_inscricao,
          color: aula.cor || '#3498db',
          allData: aula
        };
      });
      
      setEventos(eventosFormatados);
    } catch (error) {
      console.error('Erro ao carregar aulas:', error);
      setMensagem({
        tipo: 'error',
        texto: 'Erro ao carregar aulas. Tente novamente.'
      });
    } finally {
      setCarregando(false);
    }
  };

  // Carregar tipos de aula
  const carregarTiposAula = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/aulas/tipos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTiposAula(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar tipos de aula:', error);
    }
  };

  useEffect(() => {
    carregarAulas();
    if (!isAluno) {
      carregarTiposAula();
    }
  }, [isAluno]);

  // Manipular clique em um evento do calendário
  const handleEventClick = (evento) => {
    setAulaSelecionada(evento.allData);
    setInscrito(evento.statusInscricao === 'confirmada');
    setModalAberto(true);
  };

  // Inscrever-se em uma aula
  const inscreverEmAula = async () => {
    try {
      await axios.post(`${API_URL}/api/aulas/aluno/inscrever`, 
        { aula_id: aulaSelecionada.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMensagem({
        tipo: 'success',
        texto: 'Inscrição realizada com sucesso!'
      });
      
      setInscrito(true);
      carregarAulas();
    } catch (error) {
      console.error('Erro ao inscrever em aula:', error);
      setMensagem({
        tipo: 'error',
        texto: error.response?.data?.message || 'Erro ao realizar inscrição'
      });
    }
  };

  // Cancelar inscrição
  const cancelarInscricao = async () => {
    try {
      await axios.patch(`${API_URL}/api/aulas/aluno/cancelar-inscricao/${aulaSelecionada.id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMensagem({
        tipo: 'success',
        texto: 'Inscrição cancelada com sucesso!'
      });
      
      setInscrito(false);
      carregarAulas();
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
      setMensagem({
        tipo: 'error',
        texto: 'Erro ao cancelar inscrição'
      });
    }
  };

  // Atualizar status da aula (para instrutores/admin)
  const atualizarStatusAula = async (novoStatus) => {
    try {
      await axios.patch(`${API_URL}/api/aulas/${aulaSelecionada.id}/status`,
        { status: novoStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMensagem({
        tipo: 'success',
        texto: `Aula ${novoStatus === 'cancelada' ? 'cancelada' : 'marcada como realizada'} com sucesso!`
      });
      
      carregarAulas();
      setModalAberto(false);
    } catch (error) {
      console.error('Erro ao atualizar status da aula:', error);
      setMensagem({
        tipo: 'error',
        texto: 'Erro ao atualizar status da aula'
      });
    }
  };

  // Estilizar eventos no calendário
  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.color,
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: '0',
      display: 'block',
    };
    
    // Se a aula foi cancelada, estilizar diferente
    if (event.status === 'cancelada') {
      style.backgroundColor = '#777';
      style.opacity = 0.5;
      style.textDecoration = 'line-through';
    }
    
    // Se o aluno está inscrito, destacar
    if (isAluno && event.statusInscricao === 'confirmada') {
      style.border = '2px solid #fff';
      style.fontWeight = 'bold';
    }
    
    return {
      style
    };
  };

  // Componente para exibir o status da aula
  const StatusAula = ({ status }) => {
    switch (status) {
      case 'agendada':
        return <Chip color="primary" icon={<Event />} label="Agendada" size="small" />;
      case 'realizada':
        return <Chip color="success" icon={<CheckCircle />} label="Realizada" size="small" />;
      case 'cancelada':
        return <Chip color="error" icon={<Cancel />} label="Cancelada" size="small" />;
      default:
        return null;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: '80vh', position: 'relative' }}>
      {mensagem.texto && (
        <Alert 
          severity={mensagem.tipo} 
          sx={{ mb: 2 }}
          onClose={() => setMensagem({ tipo: '', texto: '' })}
        >
          {mensagem.texto}
        </Alert>
      )}
      
      {carregando ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
        </Box>
      ) : (
        <Box height="100%">
          <Typography variant="h6" gutterBottom>
            {isAluno ? 'Meu Calendário de Aulas' : 'Calendário de Aulas'}
          </Typography>
          
          {/* Calendário */}
          <Box sx={{ height: '550px', mb: 2 }}>
            <Calendar
              localizer={localizer}
              events={eventos}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleEventClick}
              views={['month', 'week', 'day']}
              defaultView='month'
              formats={{
                dayFormat: 'dd D',
                dayRangeHeaderFormat: ({ start, end }) => 
                  `${moment(start).format('DD MMM')} – ${moment(end).format('DD MMM')}`,
              }}
              messages={{
                today: 'Hoje',
                previous: 'Anterior',
                next: 'Próximo',
                month: 'Mês',
                week: 'Semana',
                day: 'Dia',
                agenda: 'Agenda',
                date: 'Data',
                time: 'Hora',
                event: 'Evento',
                noEventsInRange: 'Não há eventos neste período.'
              }}
            />
          </Box>
          
          {/* Lista de eventos agendados */}
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Próximos eventos
            </Typography>
            {eventos.length > 0 ? (
              eventos.map((evento) => (
                <Paper 
                  key={evento.id} 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    borderLeft: `4px solid ${evento.color}`,
                    cursor: 'pointer'
                  }}
                  onClick={() => handleEventClick(evento)}
                >
                  <Typography variant="subtitle1">{evento.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {moment(evento.start).format('DD/MM/YYYY HH:mm')} - {moment(evento.end).format('HH:mm')}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <Chip size="small" label={evento.tipo} sx={{ mr: 1 }} />
                    <StatusAula status={evento.status} />
                  </Box>
                </Paper>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                Nenhum evento encontrado.
              </Typography>
            )}
          </Box>
        </Box>
      )}
      
      {/* Modal de detalhes da aula */}
      {aulaSelecionada && (
        <Dialog
          open={modalAberto}
          onClose={() => setModalAberto(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: aulaSelecionada.cor || '#3498db', color: 'white' }}>
            {aulaSelecionada.titulo}
            <IconButton
              aria-label="close"
              onClick={() => setModalAberto(false)}
              sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          
          <DialogContent>
            <Box mt={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1">
                    <StatusAula status={aulaSelecionada.status} />
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center">
                    <Event sx={{ mr: 1 }} />
                    <Typography>
                      {moment(aulaSelecionada.data).format('DD/MM/YYYY')}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center">
                    <AccessTime sx={{ mr: 1 }} />
                    <Typography>
                      {moment(aulaSelecionada.hora_inicio, 'HH:mm:ss').format('HH:mm')} - 
                      {moment(aulaSelecionada.hora_fim, 'HH:mm:ss').format('HH:mm')}
                    </Typography>
                  </Box>
                </Grid>
                
                {aulaSelecionada.sala && (
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center">
                      <Room sx={{ mr: 1 }} />
                      <Typography>{aulaSelecionada.sala}</Typography>
                    </Box>
                  </Grid>
                )}
                
                {aulaSelecionada.instrutor_nome && (
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center">
                      <Person sx={{ mr: 1 }} />
                      <Typography>{aulaSelecionada.instrutor_nome}</Typography>
                    </Box>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center">
                    <Info sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {aulaSelecionada.max_participantes 
                        ? `Vagas: ${aulaSelecionada.total_inscritos || 0}/${aulaSelecionada.max_participantes}`
                        : 'Sem limite de participantes'}
                    </Typography>
                  </Box>
                </Grid>
                
                {aulaSelecionada.descricao && (
                  <Grid item xs={12}>
                    <Typography variant="body1">{aulaSelecionada.descricao}</Typography>
                  </Grid>
                )}
                
                {aulaSelecionada.observacoes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Observações:</strong> {aulaSelecionada.observacoes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 2 }}>
            {isAluno ? (
              // Botões para alunos
              aulaSelecionada.status === 'agendada' ? (
                inscrito ? (
                  <Button 
                    variant="outlined" 
                    color="error"
                    onClick={cancelarInscricao}
                  >
                    Cancelar Inscrição
                  </Button>
                ) : (
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={inscreverEmAula}
                  >
                    Inscrever-se
                  </Button>
                )
              ) : (
                <Button disabled>
                  {aulaSelecionada.status === 'cancelada' 
                    ? 'Aula Cancelada' 
                    : 'Aula Realizada'}
                </Button>
              )
            ) : (
              // Botões para admin/instrutores
              aulaSelecionada.status === 'agendada' && (
                <>
                  <Button 
                    variant="outlined" 
                    color="error"
                    onClick={() => atualizarStatusAula('cancelada')}
                  >
                    Cancelar Aula
                  </Button>
                  <Button 
                    variant="contained" 
                    color="success"
                    onClick={() => atualizarStatusAula('realizada')}
                  >
                    Marcar como Realizada
                  </Button>
                </>
              )
            )}
            <Button onClick={() => setModalAberto(false)}>Fechar</Button>
          </DialogActions>
        </Dialog>
      )}
    </Paper>
  );
};

export default AulasCalendario;