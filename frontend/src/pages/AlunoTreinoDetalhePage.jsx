import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
    Container, Typography, Box, Paper, List, ListItem, ListItemText,
    Divider, Button, CircularProgress, Card, CardContent, Chip, Grid,
    Accordion, AccordionSummary, AccordionDetails, IconButton, 
    LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Avatar, Stack, Alert, Checkbox, FormControlLabel,
    CardActions, Collapse, Rating, TableContainer, Table, TableHead,
    TableRow, TableCell, TableBody, Tooltip
} from '@mui/material';
import { 
    ArrowBack, ExpandMore, FitnessCenter, Timer, CheckCircle, 
    DirectionsRun, PlayArrow, Done, EmojiEvents, TrendingUp,
    CalendarMonth, Flag, Schedule, Restaurant, LocalFireDepartment,
    Timeline, CheckBox, CheckBoxOutlineBlank, Info, BarChart
} from '@mui/icons-material';

import { API_BASE } from '../services/api';

function AlunoTreinoDetalhePage() {
    const { id } = useParams();
    const { authHeader, aluno } = useAuth();
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
    const [historicoTreinos, setHistoricoTreinos] = useState([]);
    const [associacaoInfo, setAssociacaoInfo] = useState(null);
    const [mostrarHistorico, setMostrarHistorico] = useState(false);
    const [mostrarEstatisticas, setMostrarEstatisticas] = useState(false);
    const [checklistExercicios, setChecklistExercicios] = useState({});

    useEffect(() => {
        const fetchTreinoDetalhes = async () => {
            try {
                setLoading(true);
                // Busca o modelo de treino com os exercícios inclusos
                const responseTreino = await axios.get(`${API_BASE}/modelos-treino/${id}`, authHeader());
                setTreino(responseTreino.data);
                // Os exercícios já vêm na resposta do modelo
                const exerciciosData = Array.isArray(responseTreino.data.exercicios) ? responseTreino.data.exercicios : [];
                setExercicios(exerciciosData);
                
                // Inicializa checklist vazio para cada exercício
                const checklistInicial = {};
                exerciciosData.forEach((ex) => {
                    checklistInicial[ex.id] = Array(parseInt(ex.series) || 0).fill(false);
                });
                setChecklistExercicios(checklistInicial);

                // Busca informações da associação do aluno com este modelo
                if (aluno?.id) {
                    try {
                        const responseAssociacao = await axios.get(
                            `${API_BASE}/alunos/${aluno.id}/modelos`, 
                            authHeader()
                        );
                        const associacao = responseAssociacao.data.find(
                            assoc => assoc.modelo_treino_id === parseInt(id)
                        );
                        setAssociacaoInfo(associacao);
                    } catch (error) {
                        console.error("Erro ao buscar associação:", error);
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
                } catch (error) {
                    console.error("Erro ao buscar histórico:", error);
                }
            } catch (error) {
                console.error("Erro ao buscar detalhes do treino:", error);
                // Dados de exemplo caso a API falhe
                setTreino({
                    id: id,
                    nome: 'Treino A - Exemplo',
                    descricao: 'Treino focado em peito e tríceps',
                    nivel_dificuldade: 'Intermediário',
                    objetivo: 'Hipertrofia',
                    duracao_semanas: 8,
                    duracao_estimada: '45-60 min'
                });
                
                setExercicios([
                    { id: 1, exercicio_id: 1, nome: 'Supino Reto', grupo_muscular: 'Peito', series: 4, repeticoes: '12', descanso_segundos: 60, observacoes: 'Manter cotovelos alinhados' },
                    { id: 2, exercicio_id: 2, nome: 'Crucifixo com Halteres', grupo_muscular: 'Peito', series: 3, repeticoes: '15', descanso_segundos: 45, observacoes: 'Movimento controlado' },
                    { id: 3, exercicio_id: 3, nome: 'Tríceps Pulley', grupo_muscular: 'Tríceps', series: 4, repeticoes: '12', descanso_segundos: 40, observacoes: 'Cotovelos junto ao corpo' },
                    { id: 4, exercicio_id: 4, nome: 'Tríceps Testa', grupo_muscular: 'Tríceps', series: 3, repeticoes: '12', descanso_segundos: 45, observacoes: 'Não movimentar os cotovelos' }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchTreinoDetalhes();
    }, [id, authHeader, aluno]);

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

    // Calcular estatísticas do treino
    const calcularEstatisticas = () => {
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
            const data = {
                treino_id: id,
                data: new Date().toISOString().split('T')[0],
                duracao: Math.ceil(tempo / 60), // Converte segundos para minutos
                observacoes: notasFinais,
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
                                {treino.nome}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {treino.descricao || 'Treino personalizado'}
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
                            {associacaoInfo.observacoes && <> • <strong>Obs:</strong> {associacaoInfo.observacoes}</>}
                        </Typography>
                    </Alert>
                )}

                {/* Cards de Informações Rápidas */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ height: '100%', bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <FitnessCenter sx={{ mr: 1, fontSize: 30 }} color="primary" />
                                    <Typography variant="h6">Exercícios</Typography>
                                </Box>
                                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                                    {estatisticas.totalExercicios}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    no total
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
                                <Typography variant="body2" color="text.secondary">
                                    {estatisticas.mediaSeriesPorExercicio} por exercício
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
                                <Typography variant="body2" color="text.secondary">
                                    minutos totais
                                </Typography>
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
                                <Typography variant="h3" sx={{ fontWeight: 'bold', fontSize: '1.8rem' }}>
                                    {treino.nivel_dificuldade || 'Médio'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {treino.objetivo || 'Objetivo geral'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Botões para Expandir Estatísticas e Histórico */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                        <Button
                            fullWidth
                            variant={mostrarEstatisticas ? "contained" : "outlined"}
                            startIcon={<TrendingUp />}
                            onClick={() => setMostrarEstatisticas(!mostrarEstatisticas)}
                        >
                            {mostrarEstatisticas ? 'Ocultar' : 'Ver'} Estatísticas Detalhadas
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Button
                            fullWidth
                            variant={mostrarHistorico ? "contained" : "outlined"}
                            startIcon={<Timeline />}
                            onClick={() => setMostrarHistorico(!mostrarHistorico)}
                        >
                            {mostrarHistorico ? 'Ocultar' : 'Ver'} Histórico ({historicoTreinos.length})
                        </Button>
                    </Grid>
                </Grid>

                {/* Estatísticas Detalhadas */}
                <Collapse in={mostrarEstatisticas}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BarChart /> Estatísticas Detalhadas
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">Grupos Musculares</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                    {estatisticas.gruposMusculares.length > 0 ? (
                                        estatisticas.gruposMusculares.map((grupo, idx) => (
                                            <Chip key={idx} label={grupo} color="secondary" />
                                        ))
                                    ) : (
                                        <Chip label="Não especificado" variant="outlined" />
                                    )}
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">Duração Estimada</Typography>
                                <Typography variant="h6" sx={{ mt: 1 }}>
                                    {treino.duracao_estimada || '45-60 min'}
                                </Typography>
                            </Grid>
                            {treino.duracao_semanas && (
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Duração do Programa</Typography>
                                    <Typography variant="h6" sx={{ mt: 1 }}>
                                        {treino.duracao_semanas} semanas
                                    </Typography>
                                </Grid>
                            )}
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary">Treinos Realizados</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                    <EmojiEvents sx={{ fontSize: 30, color: 'gold' }} />
                                    <Typography variant="h6">
                                        {historicoTreinos.length} vezes
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Collapse>

                {/* Histórico de Treinos */}
                <Collapse in={mostrarHistorico}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Timeline /> Histórico de Treinos Realizados
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {historicoTreinos.length > 0 ? (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><strong>Data</strong></TableCell>
                                            <TableCell><strong>Duração</strong></TableCell>
                                            <TableCell><strong>Avaliação</strong></TableCell>
                                            <TableCell><strong>Observações</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {historicoTreinos.slice(0, 5).map((hist, idx) => (
                                            <TableRow key={idx} hover>
                                                <TableCell>{hist.data_realizacao || hist.data}</TableCell>
                                                <TableCell>{hist.duracao} min</TableCell>
                                                <TableCell>
                                                    <Rating value={hist.avaliacao} readOnly size="small" />
                                                </TableCell>
                                                <TableCell>{hist.observacoes || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Alert severity="info">
                                Este treino ainda não foi realizado. Seja o primeiro!
                            </Alert>
                        )}
                    </Paper>
                </Collapse>

                {/* Lista de Exercícios com Checklist */}
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                    <FitnessCenter sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Exercícios do Treino
                </Typography>

                {exercicios.map((exercicio, index) => {
                    const seriesCompletadas = checklistExercicios[exercicio.id]?.filter(Boolean).length || 0;
                    const totalSeries = parseInt(exercicio.series) || 0;
                    const progressoExercicio = totalSeries > 0 ? (seriesCompletadas / totalSeries) * 100 : 0;
                    
                    return (
                        <Card 
                            key={exercicio.id} 
                            sx={{
                                mb: 2,
                                bgcolor: completados.includes(index) ? '#e8f5e9' : 'inherit',
                                border: execucaoAtiva && exercicioAtual === index ? '2px solid' : 'none',
                                borderColor: 'primary.main',
                                position: 'relative'
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                                                {index + 1}
                                            </Avatar>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                {exercicio.nome || exercicio.nome_exercicio}
                                            </Typography>
                                            {completados.includes(index) && (
                                                <CheckCircle color="success" />
                                            )}
                                        </Box>
                                        
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                            {exercicio.grupo_muscular && (
                                                <Chip 
                                                    icon={<FitnessCenter />}
                                                    label={exercicio.grupo_muscular} 
                                                    size="small" 
                                                    color="secondary"
                                                />
                                            )}
                                            <Chip 
                                                label={`${exercicio.series} séries`} 
                                                size="small" 
                                                variant="outlined"
                                            />
                                            <Chip 
                                                label={`${exercicio.repeticoes} repetições`} 
                                                size="small" 
                                                color="primary"
                                                variant="outlined"
                                            />
                                            {exercicio.descanso_segundos && (
                                                <Chip 
                                                    icon={<Timer />}
                                                    label={`${exercicio.descanso_segundos}s descanso`} 
                                                    size="small" 
                                                    color="warning"
                                                    variant="outlined"
                                                />
                                            )}
                                        </Box>

                                        {exercicio.observacoes && (
                                            <Alert severity="info" sx={{ mb: 2 }}>
                                                <Typography variant="body2">
                                                    <strong>Dica:</strong> {exercicio.observacoes}
                                                </Typography>
                                            </Alert>
                                        )}

                                        {/* Checklist de Séries */}
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                Marque as séries conforme realiza:
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                                {Array.from({ length: totalSeries }).map((_, serieIdx) => (
                                                    <Tooltip key={serieIdx} title={`Série ${serieIdx + 1}`}>
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    checked={checklistExercicios[exercicio.id]?.[serieIdx] || false}
                                                                    onChange={() => toggleSerieChecklist(exercicio.id, serieIdx)}
                                                                    icon={<CheckBoxOutlineBlank />}
                                                                    checkedIcon={<CheckBox />}
                                                                    color="success"
                                                                />
                                                            }
                                                            label={`Série ${serieIdx + 1}`}
                                                        />
                                                    </Tooltip>
                                                ))}
                                            </Box>
                                            
                                            {/* Barra de Progresso do Exercício */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={progressoExercicio} 
                                                    sx={{ flex: 1, height: 6, borderRadius: 3 }}
                                                />
                                                <Typography variant="caption" color="text.secondary">
                                                    {seriesCompletadas}/{totalSeries}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </CardContent>

                            {execucaoAtiva && exercicioAtual === index && (
                                <CardActions sx={{ justifyContent: 'center', bgcolor: 'primary.light', py: 2 }}>
                                    <Button 
                                        variant="contained" 
                                        color="success"
                                        size="large"
                                        startIcon={<Done />}
                                        onClick={() => marcarCompletado(index)}
                                        disabled={seriesCompletadas < totalSeries}
                                    >
                                        {seriesCompletadas < totalSeries 
                                            ? `Complete ${totalSeries - seriesCompletadas} série(s)` 
                                            : 'Exercício Concluído!'}
                                    </Button>
                                </CardActions>
                            )}
                        </Card>
                    );
                })}

                {/* Diálogo para registrar o treino */}
                <Dialog open={dialogoRegistroAberto} onClose={() => setDialogoRegistroAberto(false)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EmojiEvents />
                            Registrar Treino Concluído
                        </Box>
                    </DialogTitle>
                    <DialogContent sx={{ mt: 2 }}>
                        <Alert severity="success" sx={{ mb: 3 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                🎉 Parabéns! Você completou o treino {treino.nome}
                            </Typography>
                            <Typography variant="body2">
                                Tempo total: {formatarTempo(tempo)} • {completados.length} exercícios completados
                            </Typography>
                        </Alert>

                        <TextField
                            label="Como foi seu treino hoje?"
                            placeholder="Adicione suas observações sobre o treino..."
                            multiline
                            rows={4}
                            fullWidth
                            variant="outlined"
                            sx={{ mb: 3 }}
                            value={notasFinais}
                            onChange={(e) => setNotasFinais(e.target.value)}
                        />

                        <Typography gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                            Avaliação do treino:
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <Rating
                                name="avaliacao-treino"
                                value={avaliacao}
                                onChange={(event, newValue) => {
                                    setAvaliacao(newValue);
                                }}
                                size="large"
                                icon={<EmojiEvents fontSize="inherit" />}
                                emptyIcon={<EmojiEvents fontSize="inherit" />}
                            />
                        </Box>
                        <Typography variant="caption" color="text.secondary" align="center" display="block">
                            {avaliacao === 1 && "Muito difícil, preciso conversar com meu instrutor"}
                            {avaliacao === 2 && "Difícil, mas consegui completar"}
                            {avaliacao === 3 && "Moderado, bom treino"}
                            {avaliacao === 4 && "Ótimo treino, me senti bem!"}
                            {avaliacao === 5 && "Excelente! Me sinto incrível!"}
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setDialogoRegistroAberto(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={registrarTreino} variant="contained" color="primary" size="large">
                            Salvar Registro
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Container>
    );
}

export default AlunoTreinoDetalhePage;