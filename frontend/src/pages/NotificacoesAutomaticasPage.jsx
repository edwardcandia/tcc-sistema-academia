// frontend/src/pages/NotificacoesAutomaticasPage.jsx
import React, { useState } from 'react';
import { 
    Container, Box, Typography, Paper, Button, TextField, Grid, 
    Divider, Snackbar, Alert, FormControl, InputLabel, MenuItem, 
    Select, Accordion, AccordionSummary, AccordionDetails, List, 
    ListItem, ListItemIcon, ListItemText, Chip, CircularProgress
} from '@mui/material';
import { 
    ExpandMore, Email, Notifications, Send, CalendarMonth, 
    Person, AttachMoney, FitnessCenter, CheckCircle, Error
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { ptBR } from 'date-fns/locale';

function NotificacoesAutomaticasPage() {
    const { authHeader } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [resultadoEnvio, setResultadoEnvio] = useState(null);
    
    // Estado para teste de email
    const [testeEmail, setTesteEmail] = useState({
        destinatario: '',
        assunto: 'Teste de Notificação',
        mensagem: 'Este é um teste de envio de e-mail do sistema da Academia.'
    });
    
    // Função para testar o envio de e-mail
    const handleTestarEmail = async () => {
        if (!testeEmail.destinatario || !testeEmail.assunto || !testeEmail.mensagem) {
            setError('Preencha todos os campos para enviar o e-mail de teste.');
            return;
        }
        
        setLoading(true);
        try {
            const response = await axios.post(
                'http://localhost:3001/api/notificacoes-automaticas/testar-email',
                testeEmail,
                authHeader()
            );
            
            setSuccess(true);
            setResultadoEnvio({
                tipo: 'sucesso',
                mensagem: response.data.mensagem,
                detalhes: `ID da mensagem: ${response.data.messageId}`
            });
        } catch (err) {
            console.error('Erro ao testar e-mail:', err);
            setError('Erro ao enviar e-mail de teste. Verifique as configurações e tente novamente.');
            setResultadoEnvio({
                tipo: 'erro',
                mensagem: 'Falha no envio do e-mail',
                detalhes: err.response?.data?.mensagem || err.message
            });
        } finally {
            setLoading(false);
        }
    };
    
    // Função para enviar lembretes de pagamento
    const handleEnviarLembretesPagamento = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                'http://localhost:3001/api/notificacoes-automaticas/enviar-lembretes-pagamento',
                {},
                authHeader()
            );
            
            setSuccess(true);
            setResultadoEnvio({
                tipo: 'sucesso',
                mensagem: response.data.mensagem,
                detalhes: 'Lembretes de pagamento processados e enviados com sucesso.'
            });
        } catch (err) {
            console.error('Erro ao enviar lembretes de pagamento:', err);
            setError('Erro ao processar lembretes de pagamento.');
            setResultadoEnvio({
                tipo: 'erro',
                mensagem: 'Falha no envio dos lembretes de pagamento',
                detalhes: err.response?.data?.mensagem || err.message
            });
        } finally {
            setLoading(false);
        }
    };
    
    // Função para enviar lembretes de treino
    const handleEnviarLembretesTreino = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                'http://localhost:3001/api/notificacoes-automaticas/enviar-lembretes-treino',
                {},
                authHeader()
            );
            
            setSuccess(true);
            setResultadoEnvio({
                tipo: 'sucesso',
                mensagem: response.data.mensagem,
                detalhes: 'Lembretes de treino processados e enviados com sucesso.'
            });
        } catch (err) {
            console.error('Erro ao enviar lembretes de treino:', err);
            setError('Erro ao processar lembretes de treino.');
            setResultadoEnvio({
                tipo: 'erro',
                mensagem: 'Falha no envio dos lembretes de treino',
                detalhes: err.response?.data?.mensagem || err.message
            });
        } finally {
            setLoading(false);
        }
    };
    
    // Função para fechar alertas
    const handleCloseAlert = () => {
        setSuccess(false);
        setError(null);
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Notifications color="primary" sx={{ mr: 2, fontSize: 30 }} />
                    <Typography variant="h4" component="h1">
                        Notificações Automáticas
                    </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" paragraph>
                    Gerencie e envie notificações automáticas para os alunos via e-mail e sistema.
                </Typography>
                
                {/* Testar envio de e-mail */}
                <Paper sx={{ p: 3, mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Email color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h5">Testar Envio de E-mail</Typography>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="E-mail de Destino"
                                fullWidth
                                value={testeEmail.destinatario}
                                onChange={(e) => setTesteEmail({ ...testeEmail, destinatario: e.target.value })}
                                margin="normal"
                                type="email"
                                required
                            />
                            <TextField
                                label="Assunto"
                                fullWidth
                                value={testeEmail.assunto}
                                onChange={(e) => setTesteEmail({ ...testeEmail, assunto: e.target.value })}
                                margin="normal"
                                required
                            />
                            <TextField
                                label="Mensagem"
                                fullWidth
                                multiline
                                rows={4}
                                value={testeEmail.mensagem}
                                onChange={(e) => setTesteEmail({ ...testeEmail, mensagem: e.target.value })}
                                margin="normal"
                                required
                            />
                            <Button 
                                variant="contained" 
                                color="primary" 
                                startIcon={<Send />}
                                onClick={handleTestarEmail}
                                disabled={loading}
                                sx={{ mt: 2 }}
                            >
                                {loading ? <CircularProgress size={24} /> : "Enviar E-mail de Teste"}
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, height: '100%' }}>
                                <Typography variant="subtitle1" gutterBottom>Instruções:</Typography>
                                <Typography variant="body2" paragraph>
                                    Use esta ferramenta para testar o envio de e-mails antes de configurar as notificações automáticas.
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    Preencha o e-mail de destino, assunto e mensagem. Ao clicar em "Enviar", o sistema tentará enviar o e-mail
                                    para o destinatário informado.
                                </Typography>
                                <Typography variant="body2" color="error">
                                    Importante: Certifique-se de que as configurações de SMTP estão corretas no arquivo .env do servidor.
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
                
                {/* Notificações Automáticas */}
                <Paper sx={{ p: 3, mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CalendarMonth color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h5">Enviar Notificações Agendadas</Typography>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <AttachMoney color="primary" sx={{ mr: 1 }} />
                                        <Typography>Lembretes de Pagamento</Typography>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography variant="body2" paragraph>
                                        Envie lembretes automáticos para alunos com pagamentos próximos do vencimento.
                                        O sistema identificará pagamentos pendentes nos próximos 3 dias.
                                    </Typography>
                                    <Button 
                                        variant="contained" 
                                        color="primary" 
                                        startIcon={<Send />}
                                        onClick={handleEnviarLembretesPagamento}
                                        disabled={loading}
                                    >
                                        {loading ? <CircularProgress size={24} /> : "Enviar Lembretes de Pagamento"}
                                    </Button>
                                </AccordionDetails>
                            </Accordion>
                            
                            <Accordion sx={{ mt: 2 }}>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <FitnessCenter color="primary" sx={{ mr: 1 }} />
                                        <Typography>Lembretes de Treino</Typography>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography variant="body2" paragraph>
                                        Envie lembretes automáticos para alunos com treinos agendados para hoje.
                                        O sistema identificará treinos baseados nos dias da semana configurados.
                                    </Typography>
                                    <Button 
                                        variant="contained" 
                                        color="primary" 
                                        startIcon={<Send />}
                                        onClick={handleEnviarLembretesTreino}
                                        disabled={loading}
                                    >
                                        {loading ? <CircularProgress size={24} /> : "Enviar Lembretes de Treino"}
                                    </Button>
                                </AccordionDetails>
                            </Accordion>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Resumo das Notificações Automáticas
                                </Typography>
                                
                                <Typography variant="body2" paragraph>
                                    O sistema está configurado para enviar os seguintes tipos de notificações:
                                </Typography>
                                
                                <List dense>
                                    <ListItem>
                                        <ListItemIcon>
                                            <AttachMoney color="primary" />
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary="Lembretes de Pagamento" 
                                            secondary="Para pagamentos com vencimento em até 3 dias" 
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <FitnessCenter color="primary" />
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary="Lembretes de Treino" 
                                            secondary="Para alunos com treinos agendados para hoje" 
                                        />
                                    </ListItem>
                                </List>
                                
                                <Typography variant="body2" paragraph mt={2}>
                                    Para automação completa, configure agendamentos no servidor usando ferramentas como 
                                    Cron Jobs, Task Scheduler ou uma ferramenta de automação na nuvem.
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
                
                {/* Resultado do envio */}
                {resultadoEnvio && (
                    <Paper sx={{ p: 3, mb: 4, bgcolor: resultadoEnvio.tipo === 'sucesso' ? '#e8f5e9' : '#ffebee' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            {resultadoEnvio.tipo === 'sucesso' ? 
                                <CheckCircle color="success" sx={{ mr: 1 }} /> : 
                                <Error color="error" sx={{ mr: 1 }} />
                            }
                            <Typography variant="h6">
                                {resultadoEnvio.tipo === 'sucesso' ? 'Operação Concluída' : 'Erro na Operação'}
                            </Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        
                        <Typography variant="subtitle1" gutterBottom>
                            {resultadoEnvio.mensagem}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary">
                            {resultadoEnvio.detalhes}
                        </Typography>
                    </Paper>
                )}
            </Box>
            
            {/* Alertas */}
            <Snackbar open={success} autoHideDuration={6000} onClose={handleCloseAlert}>
                <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
                    Operação realizada com sucesso!
                </Alert>
            </Snackbar>
            
            <Snackbar open={error !== null} autoHideDuration={6000} onClose={handleCloseAlert}>
                <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default NotificacoesAutomaticasPage;