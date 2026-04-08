import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
    Container, Typography, Box, Paper, List, ListItem, ListItemText,
    Divider, Button, CircularProgress, Card, CardContent, Chip, Grid,
    Accordion, AccordionSummary, AccordionDetails, IconButton, 
    LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Avatar, Stack, Alert, Checkbox, FormControlLabel,
    CardActions, Collapse, Rating, TableContainer, Table, TableHead,
    TableRow, TableCell, TableBody, Tooltip, Link
} from '@mui/material';
import { 
    ArrowBack, ExpandMore, FitnessCenter, Timer, CheckCircle, 
    DirectionsRun, PlayArrow, Done, EmojiEvents, TrendingUp,
    CalendarMonth, Flag, Schedule, Restaurant, LocalFireDepartment,
    Timeline, CheckBox, CheckBoxOutlineBlank, Info, BarChart,
    YouTube, Image, MenuBook
} from '@mui/icons-material';

import { API_BASE } from '../services/api';
import ChatbotWidget from '../components/chat/ChatbotWidget';

function AlunoTreinoDetalhePage() {
    const { id } = useParams();
    const { authHeader, aluno } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [treino, setTreino] = useState(null);
    const [exercicios, setExercicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorState, setErrorState] = useState(null);
    const [execucaoAtiva, setExecucaoAtiva] = useState(false);
    const [exercicioAtual, setExercicioAtual] = useState(0);
    const [tempo, setTempo] = useState(0);
    const [completados, setCompletados] = useState([]);
    const [dialogoRegistroAberto, setDialogoRegistroAberto] = useState(false);
    const [notasFinais, setNotasFinais] = useState('');
    const [avaliacao, setAvaliacao] = useState(5);
    const [historicoTreinos, setHistoricoTreinos] = useState([]);
    const [associacaoInfo, setAssociacaoInfo] = useState(null);
    const [mostrarHistorico, setMostrarHistorico] = useState(false);
    const [mostrarEstatisticas, setMostrarEstatisticas] = useState(false);
    const [checklistExercicios, setChecklistExercicios] = useState({});
    const [cargasExercicios, setCargasExercicios] = useState({});
    const [imagemPreview, setImagemPreview] = useState(null);

    const handleOpenImage = (url) => {
        setImagemPreview(url);
    };

    useEffect(() => {
        const fetchTreinoDetalhes = async () => {
            if (!id || id === 'undefined') {
                setErrorState("ID do treino não fornecido.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setErrorState(null);
                
                // Busca o modelo de treino com os exercícios inclusos através do portal do aluno
                const responseTreino = await axios.get(`${API_BASE}/portal/meus-treinos/${id}`, authHeader());
                setTreino(responseTreino.data);
                
                const exerciciosData = Array.isArray(responseTreino.data.exercicios) ? responseTreino.data.exercicios : [];
                setExercicios(exerciciosData);
                
                // Inicializa checklist e cargas
                const checklistInicial = {};
                const cargasIniciais = {};
                exerciciosData.forEach((ex) => {
                    const numSeries = parseInt(ex.series) || 0;
                    checklistInicial[ex.id] = Array(numSeries).fill(false);
                    cargasIniciais[ex.id] = Array(numSeries).fill('');
                });
                setChecklistExercicios(checklistInicial);
                setCargasExercicios(cargasIniciais);

                // Busca informações da associação do aluno com este modelo
                if (aluno?.id) {
                    try {
                        const responseAssociacao = await axios.get(
                            `${API_BASE}/alunos-modelos/aluno/${aluno.id}`, 
                            authHeader()
                        );
                        const associacao = responseAssociacao.data.find(
                            assoc => assoc.modelo_treino_id === parseInt(id)
                        );
                        setAssociacaoInfo(associacao);
                    } catch (e) {
                        console.error("Erro ao buscar associação:", e);
                    }
                }

                // Busca histórico de treinos realizados deste modelo
                try {
                    const responseHistorico = await axios.get(
                        `${API_BASE}/registro-treino/historico`, 
                        authHeader()
                    );
                    if (responseHistorico.data.success) {
                        const historicoDeste = responseHistorico.data.data.filter(
                            reg => reg.treino_id === parseInt(id)
                        );
                        setHistoricoTreinos(historicoDeste);
                    }
                } catch (e) {
                    console.error("Erro ao buscar histórico:", e);
                }
            } catch (error) {
                console.error("Erro ao buscar detalhes do treino:", error);
                setErrorState("Não foi possível carregar os detalhes do treino. Verifique sua conexão ou se este treino ainda está ativo.");
            } finally {
                setLoading(false);
            }
        };

        fetchTreinoDetalhes();
    }, [id, authHeader, aluno]);

    // Iniciar treino automaticamente se solicitado via navegação
    useEffect(() => {
        if (!loading && exercicios.length > 0 && location.state?.iniciarAuto) {
            iniciarTreino();
            // Limpa o estado para não reiniciar se recarregar a página
            window.history.replaceState({}, document.title);
        }
    }, [loading, exercicios, location.state]);

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

    // Alternar série no checklist
    const toggleSerieChecklist = (exercicioId, serieIndex) => {
        setChecklistExercicios(prev => {
            const novoChecklist = { ...prev };
            novoChecklist[exercicioId] = [...novoChecklist[exercicioId]];
            novoChecklist[exercicioId][serieIndex] = !novoChecklist[exercicioId][serieIndex];
            return novoChecklist;
        });
    };

    // Atualizar carga da série
    const handleCargaChange = (exercicioId, serieIndex, valor) => {
        setCargasExercicios(prev => {
            const novasCargas = { ...prev };
            novasCargas[exercicioId] = [...novasCargas[exercicioId]];
            novasCargas[exercicioId][serieIndex] = valor;
            return novasCargas;
        });
    };

    // Calcular estatísticas do treino
    const calcularEstatisticas = () => {
        if (!exercicios.length) return { totalSeries: 0, totalExercicios: 0, gruposMusculares: [], tempoDescansoTotal: 0, mediaSeriesPorExercicio: 0 };
        const totalSeries = exercicios.reduce((acc, ex) => acc + parseInt(ex.series || 0), 0);
        const totalExercicios = exercicios.length;
        const gruposMusculares = [...new Set(exercicios.map(ex => ex.grupo_muscular).filter(Boolean))];
        const tempoDescansoTotal = exercicios.reduce((acc, ex) => 
            acc + (parseInt(ex.descanso_segundos || 0) * parseInt(ex.series || 0)), 0
        );
        
        return {
            totalSeries,
            totalExercicios,
            gruposMusculares,
            tempoDescansoTotal: Math.ceil(tempoDescansoTotal / 60), // em minutos
            mediaSeriesPorExercicio: (totalSeries / totalExercicios).toFixed(1)
        };
    };

    const estatisticas = calcularEstatisticas();

    // Finalizar treino
    const finalizarTreino = () => {
        setExecucaoAtiva(false);
        setDialogoRegistroAberto(true);
    };

    // Registrar treino completo
    const registrarTreino = async () => {
        try {
            // Construir observações detalhadas com as cargas
            let obsCargas = "";
            exercicios.forEach(ex => {
                const cargas = cargasExercicios[ex.id]?.filter(c => c !== "").join(", ");
                if (cargas) {
                    obsCargas += `\n- ${ex.nome || ex.nome_exercicio}: ${cargas} kg`;
                }
            });

            const data = {
                treino_id: id,
                data: new Date().toISOString().split('T')[0],
                duracao: Math.ceil(tempo / 60),
                observacoes: notasFinais + (obsCargas ? `\n\nCargas registradas:${obsCargas}` : ""),
                avaliacao: avaliacao
            };
            
            const response = await axios.post(
                `${API_BASE}/registro-treino/registrar`, 
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

    if (errorState) {
        return (
            <Container maxWidth="md">
                <Box sx={{ my: 4 }}>
                    <Alert severity="error" action={
                        <Button color="inherit" size="small" onClick={() => navigate('/aluno/dashboard')}>
                            Voltar ao Início
                        </Button>
                    }>
                        {errorState}
                    </Alert>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                {/* Header com Navegação e Controles */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton onClick={() => navigate('/aluno/dashboard')} sx={{ mr: 1 }}>
                            <ArrowBack />
                        </IconButton>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                {treino?.nome}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {treino?.descricao || 'Treino personalizado'}
                            </Typography>
                        </Box>
                    </Box>
                    {execucaoAtiva ? (
                        <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText', px: 2, py: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Timer sx={{ fontSize: 30 }} />
                                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                    {formatarTempo(tempo)}
                                </Typography>
                                <Button 
                                    variant="contained" 
                                    color="error"
                                    onClick={finalizarTreino}
                                    size="small"
                                >
                                    Finalizar
                                </Button>
                            </Box>
                        </Card>
                    ) : (
                        <Button 
                            variant="contained" 
                            color="primary"
                            startIcon={<PlayArrow />}
                            onClick={iniciarTreino}
                            size="large"
                            sx={{ px: 4, py: 1.5 }}
                        >
                            Iniciar Treino
                        </Button>
                    )}
                </Box>

                {/* Barra de Progresso durante execução */}
                {execucaoAtiva && (
                    <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.light' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6" sx={{ color: 'primary.contrastText' }}>
                                Progresso do Treino
                            </Typography>
                            <Chip 
                                icon={<CheckCircle />}
                                label={`${completados.length} / ${exercicios.length} exercícios`}
                                color="success"
                            />
                        </Box>
                        <LinearProgress 
                            variant="determinate" 
                            value={(completados.length / exercicios.length) * 100} 
                            sx={{ height: 10, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.3)' }}
                        />
                    </Paper>
                )}

                {/* Informações da Associação */}
                {associacaoInfo && (
                    <Alert severity="info" sx={{ mb: 3 }} icon={<Info />}>
                        <Typography variant="body2">
                            <strong>Status:</strong> {associacaoInfo.status} • 
                            <strong> Início:</strong> {associacaoInfo.data_inicio || 'Não definido'} • 
                            <strong> Término previsto:</strong> {associacaoInfo.data_fim || 'Não definido'}
                        </Typography>
                    </Alert>
                )}

                {/* Cards de Informações Rápidas */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <FitnessCenter sx={{ mr: 1, fontSize: 30 }} color="primary" />
                                    <Typography variant="h6">Exercícios</Typography>
                                </Box>
                                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                                    {estatisticas.totalExercicios}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <BarChart sx={{ mr: 1, fontSize: 30 }} color="secondary" />
                                    <Typography variant="h6">Séries</Typography>
                                </Box>
                                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                                    {estatisticas.totalSeries}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Timer sx={{ mr: 1, fontSize: 30 }} color="warning" />
                                    <Typography variant="h6">Descanso</Typography>
                                </Box>
                                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                                    {estatisticas.tempoDescansoTotal}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">minutos totais</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Flag sx={{ mr: 1, fontSize: 30 }} color="success" />
                                    <Typography variant="h6">Nível</Typography>
                                </Box>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
                                    {treino?.nivel_dificuldade || 'Médio'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">{treino?.objetivo}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Lista de Exercícios */}
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                    <FitnessCenter sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Sequência de Exercícios
                </Typography>

                {exercicios.map((exercicio, index) => {
                    const seriesCompletadas = checklistExercicios[exercicio.id]?.filter(Boolean).length || 0;
                    const totalSeries = parseInt(exercicio.series) || 0;
                    const progressoExercicio = totalSeries > 0 ? (seriesCompletadas / totalSeries) * 100 : 0;
                    
                    return (
                        <Card 
                            key={exercicio.id} 
                            sx={{
                                mb: 3,
                                bgcolor: completados.includes(index) ? '#f1f8e9' : 'inherit',
                                border: execucaoAtiva && exercicioAtual === index ? '2px solid' : 'none',
                                borderColor: 'primary.main',
                            }}
                        >
                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={8}>
                                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                                            {exercicio.imagem_url && (
                                                <Box 
                                                    component="img"
                                                    src={exercicio.imagem_url}
                                                    alt={exercicio.nome}
                                                    sx={{ 
                                                        width: { xs: '100%', sm: 120 },
                                                        height: { xs: 200, sm: 120 },
                                                        borderRadius: 2, 
                                                        objectFit: 'cover',
                                                        cursor: 'pointer',
                                                        border: '1px solid #eee'
                                                    }}
                                                    onClick={() => handleOpenImage(exercicio.imagem_url)}
                                                />
                                            )}
                                            <Box sx={{ flex: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                                                        {index + 1}
                                                    </Avatar>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                        {exercicio.nome}
                                                    </Typography>
                                                    {completados.includes(index) && <CheckCircle color="success" />}
                                                </Box>
                                                
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                                    <Chip label={exercicio.grupo_muscular} size="small" color="secondary" />
                                                    <Chip label={`${exercicio.series} séries`} size="small" variant="outlined" />
                                                    <Chip label={`${exercicio.repeticoes} reps`} size="small" color="primary" variant="outlined" />
                                                    {exercicio.descanso_segundos && (
                                                        <Chip icon={<Timer />} label={`${exercicio.descanso_segundos}s desc.`} size="small" color="warning" variant="outlined" />
                                                    )}
                                                </Box>

                                                {/* Instruções e Mídia */}
                                                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                                    {exercicio.link_video && (
                                                        <Button 
                                                            size="small" 
                                                            startIcon={<YouTube />} 
                                                            color="error" 
                                                            component={Link} 
                                                            href={exercicio.link_video} 
                                                            target="_blank"
                                                        >
                                                            Ver Vídeo
                                                        </Button>
                                                    )}
                                                    {exercicio.instrucoes && (
                                                        <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' }, width: '100%' }}>
                                                            <AccordionSummary expandIcon={<ExpandMore />} sx={{ p: 0, minHeight: 0 }}>
                                                                <Button size="small" startIcon={<MenuBook />} color="info">
                                                                    Instruções
                                                                </Button>
                                                            </AccordionSummary>
                                                            <AccordionDetails sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                                                <Typography variant="body2">{exercicio.instrucoes}</Typography>
                                                            </AccordionDetails>
                                                        </Accordion>
                                                    )}
                                                </Stack>

                                                {exercicio.observacoes && (
                                                    <Alert severity="info" sx={{ mb: 2, py: 0 }}>
                                                        <Typography variant="caption"><strong>Dica do Instrutor:</strong> {exercicio.observacoes}</Typography>
                                                    </Alert>
                                                )}
                                            </Box>
                                        </Box>
                                    </Grid>

                                    {/* Checklist e Cargas */}
                                    <Grid item xs={12} md={4}>
                                        <Paper variant="outlined" sx={{ p: 1.5 }}>
                                            <Typography variant="subtitle2" gutterBottom>Registro de Séries:</Typography>
                                            <TableContainer>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell sx={{ p: 0.5 }}>OK</TableCell>
                                                            <TableCell sx={{ p: 0.5 }}>Série</TableCell>
                                                            <TableCell sx={{ p: 0.5 }}>Carga (kg)</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {Array.from({ length: totalSeries }).map((_, sIdx) => (
                                                            <TableRow key={sIdx}>
                                                                <TableCell sx={{ p: 0.5 }}>
                                                                    <Checkbox 
                                                                        size="small"
                                                                        checked={checklistExercicios[exercicio.id]?.[sIdx] || false}
                                                                        onChange={() => toggleSerieChecklist(exercicio.id, sIdx)}
                                                                        color="success"
                                                                    />
                                                                </TableCell>
                                                                <TableCell sx={{ p: 0.5 }}>{sIdx + 1}ª</TableCell>
                                                                <TableCell sx={{ p: 0.5 }}>
                                                                    <TextField 
                                                                        size="small" 
                                                                        variant="standard" 
                                                                        placeholder="-"
                                                                        value={cargasExercicios[exercicio.id]?.[sIdx] || ''}
                                                                        onChange={(e) => handleCargaChange(exercicio.id, sIdx, e.target.value)}
                                                                        sx={{ width: '40px' }}
                                                                    />
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                            <Box sx={{ mt: 1 }}>
                                                <LinearProgress variant="determinate" value={progressoExercicio} sx={{ height: 4, borderRadius: 2 }} />
                                            </Box>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </CardContent>

                            {execucaoAtiva && exercicioAtual === index && (
                                <CardActions sx={{ justifyContent: 'center', bgcolor: 'primary.main', py: 1 }}>
                                    <Button 
                                        variant="contained" 
                                        color="success"
                                        startIcon={<Done />}
                                        onClick={() => marcarCompletado(index)}
                                        disabled={seriesCompletadas < totalSeries}
                                    >
                                        Próximo Exercício
                                    </Button>
                                </CardActions>
                            )}
                        </Card>
                    );
                })}

                {/* Diálogo Final */}
                <Dialog open={dialogoRegistroAberto} onClose={() => setDialogoRegistroAberto(false)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmojiEvents color="warning" /> Treino Concluído!
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ textAlign: 'center', my: 2 }}>
                            <Typography variant="h5" color="primary" gutterBottom>Bom trabalho!</Typography>
                            <Typography variant="body1">Tempo Total: <strong>{formatarTempo(tempo)}</strong></Typography>
                        </Box>
                        
                        <TextField
                            label="Notas sobre o treino"
                            multiline
                            rows={3}
                            fullWidth
                            sx={{ mt: 2 }}
                            value={notasFinais}
                            onChange={(e) => setNotasFinais(e.target.value)}
                        />
                        
                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Typography component="legend">Como você avalia este treino?</Typography>
                            <Rating value={avaliacao} onChange={(e, val) => setAvaliacao(val)} size="large" />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogoRegistroAberto(false)}>Voltar</Button>
                        <Button onClick={registrarTreino} variant="contained" color="primary">Finalizar e Salvar</Button>
                    </DialogActions>
                </Dialog>

                {/* Diálogo de Preview de Imagem */}
                <Dialog 
                    open={Boolean(imagemPreview)} 
                    onClose={() => setImagemPreview(null)} 
                    maxWidth="md"
                >
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Visualização do Exercício
                        <IconButton onClick={() => setImagemPreview(null)}>
                            <ExpandMore sx={{ transform: 'rotate(180deg)' }} />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        {imagemPreview && (
                            <Box 
                                component="img"
                                src={imagemPreview}
                                alt="Preview do exercício"
                                sx={{ width: '100%', height: 'auto', borderRadius: 1 }}
                            />
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setImagemPreview(null)}>Fechar</Button>
                    </DialogActions>
                </Dialog>
            </Box>
            <ChatbotWidget />
        </Container>
    );
}

export default AlunoTreinoDetalhePage;
