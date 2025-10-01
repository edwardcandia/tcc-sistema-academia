// frontend/src/pages/AlunoDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Container, Typography, Box, Paper, List, ListItem, ListItemText,
  Divider, Button, CircularProgress, Card, CardContent, CardActions,
  Grid, Chip, Avatar, IconButton, LinearProgress, Tabs, Tab, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Select, FormControl, InputLabel, Badge, Tooltip
} from '@mui/material';
import { 
  FitnessCenter, CalendarMonth, CheckCircle, AccessTime, 
  Assignment, TrendingUp, Person, Payment, Notifications, 
  ArrowForward, Add, Edit, EmojiEvents, Favorite, DirectionsRun,
  Home, Info
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';

function AlunoDashboardPage() {
    const { authHeader, aluno, logout } = useAuth();
    const navigate = useNavigate();
    const [meusDados, setMeusDados] = useState(null);
    const [meusPagamentos, setMeusPagamentos] = useState([]);
    const [meusTreinos, setMeusTreinos] = useState([]);
    const [loadingTreinos, setLoadingTreinos] = useState(true);
    const [treinoSelecionado, setTreinoSelecionado] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [progresso, setProgresso] = useState([]);
    const [abrirDialogo, setAbrirDialogo] = useState(false);
    const [treinoRealizado, setTreinoRealizado] = useState({
        treino_id: '',
        data: new Date().toISOString().split('T')[0],
        duracao: '',
        observacoes: '',
        avaliacao: 5
    });
    const [notificacoes, setNotificacoes] = useState([]);

    // Função para mudar de tab
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Função para abrir o diálogo de registro de treino
    const handleAbrirDialogo = (treino = null) => {
        if (treino) {
            setTreinoRealizado(prev => ({
                ...prev,
                treino_id: treino.id
            }));
        }
        setAbrirDialogo(true);
    };

    // Função para fechar o diálogo
    const handleFecharDialogo = () => {
        setAbrirDialogo(false);
        setTreinoRealizado({
            treino_id: '',
            data: new Date().toISOString().split('T')[0],
            duracao: '',
            observacoes: '',
            avaliacao: 5
        });
    };

    // Função para salvar o registro de treino
    const handleSalvarTreinoRealizado = async () => {
        try {
            const response = await axios.post('http://localhost:3001/api/registro-treino/registrar', 
                treinoRealizado, 
                authHeader()
            );
            
            if (response.data.success) {
                // Adiciona um registro local ao progresso para feedback imediato
                const novoProgresso = [...progresso, {
                    id: response.data.id,
                    data: treinoRealizado.data,
                    treino_id: treinoRealizado.treino_id,
                    treino_nome: meusTreinos.find(t => t.id === treinoRealizado.treino_id)?.nome || "Treino",
                    duracao: treinoRealizado.duracao,
                    avaliacao: treinoRealizado.avaliacao
                }];
                
                setProgresso(novoProgresso);
                handleFecharDialogo();
                
                // Mostrar mensagem de sucesso
                alert("Treino registrado com sucesso!");
            }
        } catch (error) {
            console.error("Erro ao registrar treino:", error);
            alert("Erro ao registrar treino. Tente novamente.");
        }
    };
    
    useEffect(() => {
        const fetchData = async () => {
            if (!authHeader || !aluno) return;
            try {
                setLoading(true);
                const [resDados, resPagamentos] = await Promise.all([
                    axios.get('http://localhost:3001/api/portal/meus-dados', authHeader()),
                    axios.get('http://localhost:3001/api/portal/meus-pagamentos', authHeader())
                ]);
                setMeusDados(resDados.data);
                setMeusPagamentos(resPagamentos.data);
                
                // Simulação de progresso
                setProgresso([
                    {
                        id: 1,
                        data: '2025-09-28',
                        treino_id: '1',
                        treino_nome: 'Treino A - Peito e Tríceps',
                        duracao: '45',
                        avaliacao: 4
                    },
                    {
                        id: 2,
                        data: '2025-09-30',
                        treino_id: '2',
                        treino_nome: 'Treino B - Costas e Bíceps',
                        duracao: '50',
                        avaliacao: 5
                    }
                ]);
            } catch (error) {
                console.error("Erro ao buscar dados do portal do aluno:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [authHeader, aluno]);
    
    // Carregar treinos do aluno
    useEffect(() => {
        const fetchTreinos = async () => {
            if (!authHeader || !aluno) return;
            try {
                setLoadingTreinos(true);
                const response = await axios.get(`http://localhost:3001/api/alunos/${aluno.id}/modelos-treino`, authHeader());
                setMeusTreinos(response.data);
            } catch (error) {
                console.error("Erro ao buscar treinos do aluno:", error);
            } finally {
                setLoadingTreinos(false);
            }
        };
        fetchTreinos();
    }, [authHeader, aluno]);
    
    // Carregar histórico de treinos realizados
    useEffect(() => {
        const fetchHistoricoTreinos = async () => {
            if (!authHeader || !aluno) return;
            try {
                const response = await axios.get('http://localhost:3001/api/registro-treino/historico', authHeader());
                if (response.data.success) {
                    setProgresso(response.data.data);
                }
            } catch (error) {
                console.error("Erro ao buscar histórico de treinos:", error);
                // Se falhar a API, vamos manter alguns dados de exemplo para visualização
                setProgresso([
                    {
                        id: 1,
                        data_realizacao: '2025-09-28',
                        treino_id: '1',
                        treino_nome: 'Treino A - Peito e Tríceps',
                        duracao: '45',
                        avaliacao: 4
                    },
                    {
                        id: 2,
                        data_realizacao: '2025-09-30',
                        treino_id: '2',
                        treino_nome: 'Treino B - Costas e Bíceps',
                        duracao: '50',
                        avaliacao: 5
                    }
                ]);
            }
        };
        fetchHistoricoTreinos();
    }, [authHeader, aluno]);
    
    // Carregar notificações
    useEffect(() => {
        const fetchNotificacoes = async () => {
            if (!authHeader || !aluno) return;
            try {
                const response = await axios.get('http://localhost:3001/api/notificacoes', authHeader());
                if (response.data.success) {
                    setNotificacoes(response.data.data);
                }
            } catch (error) {
                console.error("Erro ao buscar notificações:", error);
                // Se falhar a API, vamos manter alguns dados de exemplo para visualização
                setNotificacoes([
                    { id: 1, texto: "Seu plano vence em 7 dias", tipo: "alerta", lida: false },
                    { id: 2, texto: "Novo treino atribuído pelo instrutor", tipo: "info", lida: false }
                ]);
            }
        };
        fetchNotificacoes();
    }, [authHeader, aluno]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    // Marcar notificação como lida
    const marcarNotificacaoLida = async (id) => {
        try {
            await axios.patch(`http://localhost:3001/api/notificacoes/${id}/marcar-lida`, {}, authHeader());
            setNotificacoes(prev => prev.map(notif => 
                notif.id === id ? {...notif, lida: true} : notif
            ));
        } catch (error) {
            console.error("Erro ao marcar notificação como lida:", error);
        }
    };
    
    // Marcar todas as notificações como lidas
    const marcarTodasLidas = async () => {
        try {
            await axios.patch('http://localhost:3001/api/notificacoes/marcar-todas-lidas', {}, authHeader());
            setNotificacoes(prev => prev.map(notif => ({...notif, lida: true})));
        } catch (error) {
            console.error("Erro ao marcar todas notificações como lidas:", error);
        }
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

    const renderTabContent = () => {
        switch (tabValue) {
            case 0: // Dashboard principal
                return (
                    <>
                        {/* Estatísticas Rápidas */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', height: '100%' }}>
                                    <CardContent>
                                        <FitnessCenter />
                                        <Typography variant="h6" gutterBottom>Treinos</Typography>
                                        <Typography variant="h4">{meusTreinos.length}</Typography>
                                        <Typography variant="body2">treinos disponíveis</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ bgcolor: '#e3f2fd', color: '#1565c0', height: '100%' }}>
                                    <CardContent>
                                        <CheckCircle />
                                        <Typography variant="h6" gutterBottom>Realizados</Typography>
                                        <Typography variant="h4">{progresso.length}</Typography>
                                        <Typography variant="body2">treinos completados</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ bgcolor: '#fff3e0', color: '#e65100', height: '100%' }}>
                                    <CardContent>
                                        <TrendingUp />
                                        <Typography variant="h6" gutterBottom>Progresso</Typography>
                                        <Typography variant="h4">
                                            {progresso.length > 0 ? "Ativo" : "Inicie!"}
                                        </Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={progresso.length > 0 ? 75 : 0} 
                                            sx={{ mt: 1 }}
                                        />
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card sx={{ bgcolor: '#f3e5f5', color: '#6a1b9a', height: '100%' }}>
                                    <CardContent>
                                        <Favorite />
                                        <Typography variant="h6" gutterBottom>Saúde</Typography>
                                        <Typography variant="h4">Bom</Typography>
                                        <Typography variant="body2">baseado na regularidade</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                        
                        {/* Notificações */}
                        <Paper sx={{ p: 2, mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">Notificações</Typography>
                                <Box>
                                    <Chip 
                                        label={`${notificacoes.filter(n => !n.lida).length} novas`} 
                                        size="small" 
                                        color="primary" 
                                        sx={{ mr: 1 }}
                                    />
                                    <Button 
                                        size="small" 
                                        onClick={marcarTodasLidas}
                                        disabled={notificacoes.every(n => n.lida)}
                                    >
                                        Marcar todas como lidas
                                    </Button>
                                </Box>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            {notificacoes.length > 0 ? (
                                <List>
                                    {notificacoes.map(notificacao => (
                                        <ListItem 
                                            key={notificacao.id}
                                            sx={{ 
                                                bgcolor: notificacao.lida ? 'inherit' : '#f5f5f5',
                                                opacity: notificacao.lida ? 0.7 : 1,
                                                mb: 1,
                                                borderRadius: 1
                                            }}
                                            secondaryAction={
                                                <IconButton 
                                                    edge="end" 
                                                    aria-label="mark as read"
                                                    onClick={() => marcarNotificacaoLida(notificacao.id)}
                                                    disabled={notificacao.lida}
                                                >
                                                    <CheckCircle />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemIcon>
                                                {notificacao.tipo === 'alerta' ? <Notifications color="error" /> : <Info color="primary" />}
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary={notificacao.texto} 
                                                secondary={new Date(notificacao.created_at).toLocaleDateString()}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Typography>Nenhuma notificação no momento.</Typography>
                            )}
                        </Paper>
                        
                        {/* Próximo Treino */}
                        <Paper sx={{ p: 2, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>Próximo Treino</Typography>
                            <Divider sx={{ mb: 2 }} />
                            {meusTreinos.length > 0 ? (
                                <Box>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={12} md={4}>
                                            <Typography variant="h5">{meusTreinos[0].nome}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {meusTreinos[0].descricao || "Treino personalizado"}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} md={5}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <DirectionsRun sx={{ mr: 1 }} color="action" />
                                                <Typography variant="body2">
                                                    {meusTreinos[0].total_exercicios || "5"} exercícios
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <AccessTime sx={{ mr: 1 }} color="action" />
                                                <Typography variant="body2">
                                                    Duração estimada: {meusTreinos[0].duracao_estimada || "45-60"} min
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                                            <Button 
                                                variant="contained"
                                                color="primary"
                                                onClick={() => navigate(`/aluno/treinos/${meusTreinos[0].id}`)}
                                                sx={{ mr: 1 }}
                                            >
                                                Ver Detalhes
                                            </Button>
                                            <Button 
                                                variant="outlined"
                                                color="success"
                                                onClick={() => handleAbrirDialogo(meusTreinos[0])}
                                            >
                                                Registrar
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                            ) : (
                                <Alert severity="info">
                                    Você ainda não possui treinos atribuídos. Fale com seu instrutor.
                                </Alert>
                            )}
                        </Paper>
                        
                        {/* Progresso Recente */}
                        <Paper sx={{ p: 2, mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">Progresso Recente</Typography>
                                <Button 
                                    color="primary"
                                    onClick={() => setTabValue(1)}
                                    endIcon={<ArrowForward />}
                                    size="small"
                                >
                                    Ver Todos
                                </Button>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            {progresso.length > 0 ? (
                                <List>
                                    {progresso.slice(0, 2).map(p => (
                                        <ListItem key={p.id}>
                                            <ListItemIcon>
                                                <CheckCircle color="success" />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary={p.treino_nome}
                                                secondary={`Realizado em ${p.data} • Duração: ${p.duracao} minutos`}
                                            />
                                            <Chip
                                                icon={<EmojiEvents />}
                                                label={`Avaliação: ${p.avaliacao}/5`}
                                                size="small"
                                                color={p.avaliacao >= 4 ? "success" : "default"}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Typography>Nenhum treino registrado ainda. Comece a registrar seus treinos!</Typography>
                            )}
                            <Button
                                variant="outlined"
                                startIcon={<Add />}
                                fullWidth
                                onClick={() => handleAbrirDialogo()}
                                sx={{ mt: 2 }}
                            >
                                Registrar Novo Treino
                            </Button>
                        </Paper>
                    </>
                );
                
            case 1: // Meus Treinos
                return (
                    <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">Meus Treinos</Typography>
                            <Chip 
                                label={`${meusTreinos.length} treinos disponíveis`} 
                                color="primary" 
                            />
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        {loadingTreinos ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : meusTreinos.length > 0 ? (
                            <Grid container spacing={2}>
                                {meusTreinos.map(treino => (
                                    <Grid item xs={12} sm={6} md={4} key={treino.id}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6">{treino.nome}</Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    {treino.descricao || "Treino personalizado"}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <FitnessCenter fontSize="small" sx={{ mr: 1 }} color="action" />
                                                    <Typography variant="body2">
                                                        {treino.total_exercicios || "5"} exercícios
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                            <CardActions>
                                                <Button 
                                                    size="small" 
                                                    color="primary"
                                                    onClick={() => navigate(`/aluno/treinos/${treino.id}`)}
                                                >
                                                    Ver Detalhes
                                                </Button>
                                                <Button 
                                                    size="small" 
                                                    color="success"
                                                    onClick={() => handleAbrirDialogo(treino)}
                                                >
                                                    Registrar Treino
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Alert severity="info">
                                Você ainda não possui treinos atribuídos. Fale com seu instrutor.
                            </Alert>
                        )}
                    </Paper>
                );
                
            case 2: // Meu Progresso
                return (
                    <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">Meu Progresso</Typography>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => handleAbrirDialogo()}
                            >
                                Registrar Treino
                            </Button>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        {progresso.length > 0 ? (
                            <List>
                                {progresso.map(p => (
                                    <ListItem key={p.id} sx={{ bgcolor: '#f5f5f5', mb: 1, borderRadius: 1 }}>
                                        <ListItemIcon>
                                            <CheckCircle color="success" />
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="subtitle1">{p.treino_nome}</Typography>
                                                    <Chip
                                                        size="small"
                                                        label={`${p.data}`}
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <>
                                                    <Typography variant="body2">Duração: {p.duracao} minutos</Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                        <Typography variant="body2" sx={{ mr: 1 }}>Avaliação:</Typography>
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <EmojiEvents 
                                                                key={i}
                                                                fontSize="small"
                                                                color={i < p.avaliacao ? "warning" : "disabled"}
                                                            />
                                                        ))}
                                                    </Box>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Alert severity="info">
                                Você ainda não registrou nenhum treino. Comece a registrar para acompanhar seu progresso!
                            </Alert>
                        )}
                    </Paper>
                );
                
            case 3: // Meu Perfil
                return (
                    <>
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Avatar 
                                    sx={{ width: 80, height: 80, mr: 3 }}
                                >
                                    {meusDados?.nome_completo?.charAt(0) || "A"}
                                </Avatar>
                                <Box>
                                    <Typography variant="h5">{meusDados?.nome_completo}</Typography>
                                    <Typography variant="body1" color="text.secondary">{meusDados?.email}</Typography>
                                    <Chip 
                                        label="Aluno Ativo" 
                                        color="success" 
                                        size="small"
                                        sx={{ mt: 1 }}
                                    />
                                </Box>
                                <Box sx={{ ml: 'auto' }}>
                                    <Tooltip title="Editar perfil">
                                        <IconButton>
                                            <Edit />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Typography variant="h6" gutterBottom>Informações Pessoais</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">CPF</Typography>
                                    <Typography variant="body1">{meusDados?.cpf || "Não informado"}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Telefone</Typography>
                                    <Typography variant="body1">{meusDados?.telefone || "Não informado"}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Data de Nascimento</Typography>
                                    <Typography variant="body1">{meusDados?.data_nascimento || "Não informada"}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Gênero</Typography>
                                    <Typography variant="body1">{meusDados?.genero || "Não informado"}</Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                        
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>Meu Plano</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Plano Atual</Typography>
                                    <Typography variant="h6">{meusDados?.nome_plano || "Nenhum plano ativo"}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Próximo Vencimento</Typography>
                                    <Typography variant="h6">{meusDados?.proximo_vencimento || "Aguardando primeiro pagamento"}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Histórico de Pagamentos</Typography>
                                    <List dense sx={{ maxHeight: 200, overflow: 'auto', bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                        {meusPagamentos.length > 0 ? meusPagamentos.map(pg => (
                                            <ListItem key={pg.id}>
                                                <ListItemIcon>
                                                    <Payment color="success" />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary={`Pagamento de R$ ${parseFloat(pg.valor).toFixed(2)}`} 
                                                    secondary={`Realizado em ${pg.data_pagamento}`} 
                                                />
                                            </ListItem>
                                        )) : (
                                            <ListItem>
                                                <ListItemText primary="Nenhum pagamento registrado." />
                                            </ListItem>
                                        )}
                                    </List>
                                </Grid>
                            </Grid>
                        </Paper>
                    </>
                );
                
            default:
                return <Typography>Conteúdo não encontrado</Typography>;
        }
    };

    // Diálogo para registrar um treino
    const renderDialogoRegistrarTreino = () => (
        <Dialog open={abrirDialogo} onClose={handleFecharDialogo} maxWidth="sm" fullWidth>
            <DialogTitle>Registrar Treino Realizado</DialogTitle>
            <DialogContent>
                <FormControl fullWidth margin="normal">
                    <InputLabel id="treino-label">Treino Realizado</InputLabel>
                    <Select
                        labelId="treino-label"
                        value={treinoRealizado.treino_id}
                        onChange={(e) => setTreinoRealizado(prev => ({ ...prev, treino_id: e.target.value }))}
                        label="Treino Realizado"
                    >
                        {meusTreinos.map(treino => (
                            <MenuItem key={treino.id} value={treino.id}>{treino.nome}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    margin="normal"
                    label="Data"
                    type="date"
                    fullWidth
                    value={treinoRealizado.data}
                    onChange={(e) => setTreinoRealizado(prev => ({ ...prev, data: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    margin="normal"
                    label="Duração (minutos)"
                    type="number"
                    fullWidth
                    value={treinoRealizado.duracao}
                    onChange={(e) => setTreinoRealizado(prev => ({ ...prev, duracao: e.target.value }))}
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel id="avaliacao-label">Avaliação</InputLabel>
                    <Select
                        labelId="avaliacao-label"
                        value={treinoRealizado.avaliacao}
                        onChange={(e) => setTreinoRealizado(prev => ({ ...prev, avaliacao: e.target.value }))}
                        label="Avaliação"
                    >
                        <MenuItem value={1}>1 - Muito ruim</MenuItem>
                        <MenuItem value={2}>2 - Ruim</MenuItem>
                        <MenuItem value={3}>3 - Regular</MenuItem>
                        <MenuItem value={4}>4 - Bom</MenuItem>
                        <MenuItem value={5}>5 - Excelente</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    margin="normal"
                    label="Observações (opcional)"
                    multiline
                    rows={3}
                    fullWidth
                    value={treinoRealizado.observacoes}
                    onChange={(e) => setTreinoRealizado(prev => ({ ...prev, observacoes: e.target.value }))}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleFecharDialogo}>Cancelar</Button>
                <Button 
                    onClick={handleSalvarTreinoRealizado} 
                    variant="contained" 
                    color="primary" 
                    disabled={!treinoRealizado.treino_id || !treinoRealizado.data || !treinoRealizado.duracao}
                >
                    Salvar
                </Button>
            </DialogActions>
        </Dialog>
    );

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom>
                            Olá, {meusDados?.nome_completo?.split(' ')[0] || aluno?.nome?.split(' ')[0] || 'Aluno'}!
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Bem-vindo ao seu painel de controle. Acompanhe seus treinos e evolução.
                        </Typography>
                    </Box>
                    <Badge badgeContent={notificacoes.length} color="error">
                        <Button variant="outlined" onClick={handleLogout} endIcon={<ArrowForward />}>
                            Sair
                        </Button>
                    </Badge>
                </Box>
                
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab icon={<Home />} label="Dashboard" />
                    <Tab icon={<FitnessCenter />} label="Meus Treinos" />
                    <Tab icon={<TrendingUp />} label="Meu Progresso" />
                    <Tab icon={<Person />} label="Meu Perfil" />
                </Tabs>
                
                {renderTabContent()}
                {renderDialogoRegistrarTreino()}
            </Box>
        </Container>
    );
}

export default AlunoDashboardPage;