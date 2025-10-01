// frontend/src/pages/AlunoTreinoDetalhePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
    Container, Typography, Box, Paper, List, ListItem, ListItemText,
    Divider, Button, CircularProgress, Card, CardContent, Chip, Grid,
    Accordion, AccordionSummary, AccordionDetails, IconButton, 
    LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField
} from '@mui/material';
import { 
    ArrowBack, ExpandMore, FitnessCenter, Timer, CheckCircle, 
    DirectionsRun, PlayArrow, Done
} from '@mui/icons-material';

function AlunoTreinoDetalhePage() {
    const { id } = useParams();
    const { authHeader } = useAuth();
    const navigate = useNavigate();
    const [treino, setTreino] = useState(null);
    const [exercicios, setExercicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [execucaoAtiva, setExecucaoAtiva] = useState(false);
    const [exercicioAtual, setExercicioAtual] = useState(0);
    const [tempo, setTempo] = useState(0);
    const [completados, setCompletados] = useState([]);
    const [dialogoRegistroAberto, setDialogoRegistroAberto] = useState(false);
    const [notasFinais, setNotasFinais] = useState('');
    const [avaliacao, setAvaliacao] = useState(5);

    useEffect(() => {
        const fetchTreinoDetalhes = async () => {
            try {
                setLoading(true);
                const responseTreino = await axios.get(`http://localhost:3001/api/modelos-treino/${id}`, authHeader());
                setTreino(responseTreino.data);
                
                const responseExercicios = await axios.get(`http://localhost:3001/api/modelos-treino/${id}/exercicios`, authHeader());
                setExercicios(responseExercicios.data);
            } catch (error) {
                console.error("Erro ao buscar detalhes do treino:", error);
                // Dados de exemplo caso a API falhe
                setTreino({
                    id: id,
                    nome: 'Treino A - Exemplo',
                    descricao: 'Treino focado em peito e tríceps',
                    nivel_dificuldade: 'Intermediário',
                    duracao_estimada: '45-60 min'
                });
                
                setExercicios([
                    { id: 1, exercicio_id: 1, nome_exercicio: 'Supino Reto', series: 4, repeticoes: 12, peso: '60kg', observacoes: 'Manter cotovelos alinhados' },
                    { id: 2, exercicio_id: 2, nome_exercicio: 'Crucifixo com Halteres', series: 3, repeticoes: 15, peso: '14kg', observacoes: 'Movimento controlado' },
                    { id: 3, exercicio_id: 3, nome_exercicio: 'Tríceps Pulley', series: 4, repeticoes: 12, peso: '25kg', observacoes: 'Cotovelos junto ao corpo' },
                    { id: 4, exercicio_id: 4, nome_exercicio: 'Tríceps Testa', series: 3, repeticoes: 12, peso: '15kg', observacoes: 'Não movimentar os cotovelos' }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchTreinoDetalhes();
    }, [id, authHeader]);

    // Cronômetro para acompanhar o tempo de treino
    useEffect(() => {
        let timer;
        if (execucaoAtiva) {
            timer = setInterval(() => {
                setTempo(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [execucaoAtiva]);

    // Formatar tempo no formato mm:ss
    const formatarTempo = (segundos) => {
        const minutos = Math.floor(segundos / 60);
        const segs = segundos % 60;
        return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    };

    // Iniciar execução do treino
    const iniciarTreino = () => {
        setExercicioAtual(0);
        setTempo(0);
        setExecucaoAtiva(true);
        setCompletados([]);
    };

    // Marcar exercício como completado
    const marcarCompletado = (index) => {
        if (!completados.includes(index)) {
            setCompletados([...completados, index]);
        }
        // Se for o último exercício, avança automaticamente para a conclusão
        if (index === exercicios.length - 1) {
            setDialogoRegistroAberto(true);
        } else {
            setExercicioAtual(index + 1);
        }
    };

    // Finalizar treino
    const finalizarTreino = () => {
        setExecucaoAtiva(false);
        setDialogoRegistroAberto(true);
    };

    // Registrar treino completo
    const registrarTreino = async () => {
        try {
            const data = {
                treino_id: id,
                data: new Date().toISOString().split('T')[0],
                duracao: Math.ceil(tempo / 60), // Converte segundos para minutos
                observacoes: notasFinais,
                avaliacao: avaliacao
            };
            
            const response = await axios.post(
                'http://localhost:3001/api/registro-treino/registrar', 
                data, 
                authHeader()
            );
            
            if (response.data.success) {
                alert('Treino registrado com sucesso!');
                navigate('/aluno/dashboard');
            }
        } catch (error) {
            console.error("Erro ao registrar treino:", error);
            alert('Erro ao registrar treino. Tente novamente.');
        }
        setDialogoRegistroAberto(false);
    };

    if (loading) {
        return (
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton onClick={() => navigate('/aluno/dashboard')} sx={{ mr: 1 }}>
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h4">{treino.nome}</Typography>
                    </Box>
                    {execucaoAtiva ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h5" sx={{ mr: 2 }}>
                                {formatarTempo(tempo)}
                            </Typography>
                            <Button 
                                variant="contained" 
                                color="error"
                                onClick={finalizarTreino}
                            >
                                Finalizar Treino
                            </Button>
                        </Box>
                    ) : (
                        <Button 
                            variant="contained" 
                            color="primary"
                            startIcon={<PlayArrow />}
                            onClick={iniciarTreino}
                        >
                            Iniciar Treino
                        </Button>
                    )}
                </Box>

                <Paper sx={{ p: 3, mb: 4 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                {treino.descricao || 'Nenhuma descrição disponível.'}
                            </Typography>
                            
                            {execucaoAtiva && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                        Progresso: {completados.length} de {exercicios.length} exercícios
                                    </Typography>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={(completados.length / exercicios.length) * 100} 
                                        sx={{ height: 8, borderRadius: 5 }}
                                    />
                                </Box>
                            )}
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Card sx={{ bgcolor: '#f5f5f5' }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <FitnessCenter sx={{ mr: 1 }} color="action" />
                                            <Typography variant="body2">
                                                {exercicios.length} exercícios
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <Timer sx={{ mr: 1 }} color="action" />
                                            <Typography variant="body2">
                                                Duração estimada: {treino.duracao_estimada || '45-60 min'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <DirectionsRun sx={{ mr: 1 }} color="action" />
                                            <Typography variant="body2">
                                                Nível: {treino.nivel_dificuldade || 'Intermediário'}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                <Typography variant="h5" sx={{ mb: 3 }}>Lista de Exercícios</Typography>

                {exercicios.map((exercicio, index) => (
                    <Accordion 
                        key={exercicio.id} 
                        expanded={execucaoAtiva ? exercicioAtual === index : undefined}
                        sx={{
                            mb: 2,
                            bgcolor: completados.includes(index) ? '#e8f5e9' : 'inherit',
                            position: 'relative'
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMore />}
                            aria-controls={`panel${exercicio.id}-content`}
                            id={`panel${exercicio.id}-header`}
                        >
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                width: '100%', 
                                justifyContent: 'space-between',
                                pr: 2
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {completados.includes(index) && (
                                        <CheckCircle color="success" sx={{ mr: 1 }} />
                                    )}
                                    <Typography>{exercicio.nome_exercicio || exercicio.nome}</Typography>
                                </Box>
                                <Chip 
                                    label={`${exercicio.series} séries x ${exercicio.repeticoes} repetições`}
                                    size="small"
                                    color={completados.includes(index) ? "success" : "default"}
                                />
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={8}>
                                    <Typography variant="subtitle2" color="text.secondary">Instruções:</Typography>
                                    <Typography variant="body2" sx={{ mb: 2 }}>
                                        {exercicio.observacoes || 'Nenhuma instrução específica.'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Typography variant="body2">
                                            <strong>Séries:</strong> {exercicio.series}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Repetições:</strong> {exercicio.repeticoes}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Descanso:</strong> {exercicio.descanso_segundos}s
                                        </Typography>
                                    </Box>
                                </Grid>
                                {execucaoAtiva && exercicioAtual === index && (
                                    <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                        <Button 
                                            variant="contained" 
                                            color="success"
                                            startIcon={<Done />}
                                            onClick={() => marcarCompletado(index)}
                                        >
                                            Marcar como Concluído
                                        </Button>
                                    </Grid>
                                )}
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                ))}

                {/* Diálogo para registrar o treino */}
                <Dialog open={dialogoRegistroAberto} onClose={() => setDialogoRegistroAberto(false)}>
                    <DialogTitle>Registrar Treino Concluído</DialogTitle>
                    <DialogContent>
                        <Typography sx={{ mb: 2 }}>
                            Parabéns! Você completou o treino {treino.nome} em {formatarTempo(tempo)}.
                        </Typography>

                        <TextField
                            label="Como foi seu treino hoje?"
                            multiline
                            rows={3}
                            fullWidth
                            variant="outlined"
                            sx={{ mb: 2 }}
                            value={notasFinais}
                            onChange={(e) => setNotasFinais(e.target.value)}
                        />

                        <Typography gutterBottom>Avaliação do treino:</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            {[1, 2, 3, 4, 5].map((valor) => (
                                <IconButton 
                                    key={valor}
                                    color={valor <= avaliacao ? "warning" : "default"}
                                    onClick={() => setAvaliacao(valor)}
                                >
                                    {valor}
                                </IconButton>
                            ))}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogoRegistroAberto(false)}>Cancelar</Button>
                        <Button onClick={registrarTreino} variant="contained" color="primary">
                            Salvar Registro
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Container>
    );
}

export default AlunoTreinoDetalhePage;