import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Button, TextField, Grid, 
    Divider, Snackbar, Alert, FormControl, InputLabel, MenuItem, 
    Select, CircularProgress, Rating, List, ListItem, Chip,
    ListItemText, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { 
    Feedback as FeedbackIcon, Send, ExpandMore, CheckCircle, Comment
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AlunoFeedbackForm = () => {
    const { authHeader } = useAuth();
    const [loading, setLoading] = useState(false);
    const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [feedbacks, setFeedbacks] = useState([]);
    
    // Estado do formulário
    const [feedback, setFeedback] = useState({
        titulo: '',
        descricao: '',
        tipo: 'sugestao',
        avaliacao: 5
    });

    // Buscar feedbacks do aluno
    useEffect(() => {
        const buscarFeedbacks = async () => {
            if (!authHeader) return;
            setLoadingFeedbacks(true);
            
            try {
                const response = await axios.get('http://localhost:3001/api/feedback/aluno/meus', authHeader());
                setFeedbacks(response.data.data);
            } catch (error) {
                console.error('Erro ao buscar feedbacks:', error);
            } finally {
                setLoadingFeedbacks(false);
            }
        };
        
        buscarFeedbacks();
    }, [authHeader, success]);

    // Manipular mudança nos campos do formulário
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFeedback(prev => ({ ...prev, [name]: value }));
    };

    // Manipular mudança na avaliação
    const handleRatingChange = (event, newValue) => {
        setFeedback(prev => ({ ...prev, avaliacao: newValue }));
    };

    // Enviar feedback
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!feedback.titulo || !feedback.descricao || !feedback.tipo) {
            setError('Por favor, preencha todos os campos');
            return;
        }
        
        setLoading(true);
        try {
            await axios.post(
                'http://localhost:3001/api/feedback/aluno/novo',
                feedback,
                authHeader()
            );
            
            setSuccess(true);
            // Limpar formulário após envio bem-sucedido
            setFeedback({
                titulo: '',
                descricao: '',
                tipo: 'sugestao',
                avaliacao: 5
            });
        } catch (error) {
            console.error('Erro ao enviar feedback:', error);
            setError('Não foi possível enviar o feedback. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    // Fechar alertas
    const handleCloseAlert = () => {
        setSuccess(false);
        setError(null);
    };

    // Formatar data para exibição
    const formatarData = (dataString) => {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Mapear tipos para exibição
    const tipoTexto = {
        'sugestao': 'Sugestão',
        'elogio': 'Elogio',
        'reclamacao': 'Reclamação'
    };

    // Cores para os chips de status
    const statusCores = {
        'pendente': 'warning',
        'respondido': 'success',
        'arquivado': 'default'
    };

    // Renderizar formulário
    const renderFormulario = () => (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FeedbackIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Enviar Novo Feedback</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                        <TextField
                            fullWidth
                            label="Título"
                            name="titulo"
                            value={feedback.titulo}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Tipo de Feedback</InputLabel>
                            <Select
                                name="tipo"
                                value={feedback.tipo}
                                onChange={handleChange}
                                label="Tipo de Feedback"
                                required
                            >
                                <MenuItem value="sugestao">Sugestão</MenuItem>
                                <MenuItem value="elogio">Elogio</MenuItem>
                                <MenuItem value="reclamacao">Reclamação</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Descreva seu feedback"
                            name="descricao"
                            value={feedback.descricao}
                            onChange={handleChange}
                            margin="normal"
                            multiline
                            rows={4}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Typography variant="body1" sx={{ mr: 2 }}>Avaliação:</Typography>
                            <Rating
                                name="avaliacao"
                                value={feedback.avaliacao}
                                onChange={handleRatingChange}
                                size="large"
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            startIcon={<Send />}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : "Enviar Feedback"}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );

    // Renderizar histórico de feedbacks
    const renderHistorico = () => (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Comment color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Meus Feedbacks</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            {loadingFeedbacks ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                </Box>
            ) : feedbacks.length > 0 ? (
                feedbacks.map((item) => (
                    <Accordion key={item.id} sx={{ mb: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Grid container alignItems="center">
                                <Grid item xs={7}>
                                    <Typography>{item.titulo}</Typography>
                                </Grid>
                                <Grid item xs={5} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Chip 
                                        label={tipoTexto[item.tipo] || item.tipo} 
                                        size="small" 
                                        sx={{ mr: 1 }}
                                    />
                                    <Chip 
                                        label={item.status === 'respondido' ? 'Respondido' : 
                                              item.status === 'arquivado' ? 'Arquivado' : 'Pendente'} 
                                        color={statusCores[item.status] || 'default'}
                                        size="small" 
                                        variant="outlined"
                                    />
                                </Grid>
                            </Grid>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Enviado em: {formatarData(item.created_at)}
                                </Typography>
                                <Rating value={item.avaliacao} readOnly size="small" sx={{ mt: 1 }} />
                            </Box>
                            
                            <Typography variant="body1" paragraph>
                                {item.descricao}
                            </Typography>
                            
                            {item.resposta && (
                                <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mt: 2 }}>
                                    <Typography variant="subtitle2" color="primary" gutterBottom>
                                        Resposta da Academia:
                                    </Typography>
                                    <Typography variant="body2">
                                        {item.resposta}
                                    </Typography>
                                </Paper>
                            )}
                        </AccordionDetails>
                    </Accordion>
                ))
            ) : (
                <Alert severity="info">
                    Você ainda não enviou nenhum feedback. Use o formulário acima para enviar sua primeira avaliação ou sugestão.
                </Alert>
            )}
        </Paper>
    );

    return (
        <>
            {renderFormulario()}
            {renderHistorico()}
            
            {/* Alertas */}
            <Snackbar open={success} autoHideDuration={6000} onClose={handleCloseAlert}>
                <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
                    Feedback enviado com sucesso! Agradecemos por sua contribuição.
                </Alert>
            </Snackbar>
            
            <Snackbar open={error !== null} autoHideDuration={6000} onClose={handleCloseAlert}>
                <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </>
    );
};

export default AlunoFeedbackForm;