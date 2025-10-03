// frontend/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  CssBaseline,
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import {
  Person,
  CalendarToday,
  Paid,
  FitnessCenter,
  Notifications,
  TrendingUp,
  Info,
  ArrowForward,
  DirectionsRun,
} from "@mui/icons-material";

import DashboardCharts from "../components/DashboardCharts";

function DashboardPage() {
  const { authHeader, user, logout } = useAuth();
  const navigate = useNavigate();

  const [estatisticas, setEstatisticas] = useState({
    totalAlunos: 0,
    alunosAtivos: 0,
    receitaMes: 0,
    pagamentosPendentes: 0,
  });
  const [aniversariantes, setAniversariantes] = useState([]);
  const [pagamentosProximos, setPagamentosProximos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPageData = async () => {
    if (!authHeader) return;
    setLoading(true);
    try {
      const [resEstatisticas, resAniversariantes, resPagamentos] = await Promise.all([
        axios.get("http://localhost:3001/api/dashboard/estatisticas", authHeader()),
        axios.get("http://localhost:3001/api/dashboard/aniversariantes", authHeader()),
        axios.get("http://localhost:3001/api/dashboard/pagamentos-vencendo", authHeader()),
      ]);

      // Simplified handling - trust the backend formatting
      setEstatisticas(resEstatisticas.data);
      setAniversariantes(resAniversariantes.data);
      setPagamentosProximos(resPagamentos.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast.error("Ocorreu um erro ao carregar os dados. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();

    // Atualizar dados a cada 5 minutos
    const intervalId = setInterval(fetchPageData, 5 * 60 * 1000);

    // Limpar o intervalo quando o componente for desmontado
    return () => clearInterval(intervalId);
  }, [authHeader]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Renderiza o conteúdo de cards de estatísticas com loader quando necessário
  const renderCardContent = (title, value, isLoading, format = null) => (
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {isLoading ? (
        <Skeleton variant="rectangular" width="100%" height={40} />
      ) : (
        <Typography variant="h4">
          {format === "currency"
            ? `R$ ${parseFloat(value || 0).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).replace('.', ',')}`
            : value || 0}
        </Typography>
      )}
    </CardContent>
  );

  return (
    <>
      <CssBaseline />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h4" component="h1">
              S.G.A: Sistema de Gestão
            </Typography>
            <Button variant="outlined" onClick={handleLogout}>
              Sair
            </Button>
          </Box>

          {/* Cards de estatísticas */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={user && user.cargo === 'administrador' ? 3 : 4}>
              <Card sx={{ bgcolor: "#e3f2fd", color: "#1565c0", height: "100%" }}>
                {renderCardContent("Total de Alunos", estatisticas.totalAlunos, loading)}
                <CardContent sx={{ pt: 0, pb: 1 }}>
                  <Button
                    component={Link}
                    to="/alunos"
                    size="small"
                    endIcon={<ArrowForward />}
                    sx={{ mt: 1 }}
                  >
                    Ver Alunos
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={user && user.cargo === 'administrador' ? 3 : 4}>
              <Card sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", height: "100%" }}>
                {renderCardContent("Alunos Ativos", estatisticas.alunosAtivos, loading)}
                <CardContent sx={{ pt: 0, pb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {loading ? (
                      <Skeleton width="60%" />
                    ) : (
                      `${
                        estatisticas.totalAlunos
                          ? Math.round(
                              (estatisticas.alunosAtivos / estatisticas.totalAlunos) * 100
                            )
                          : 0
                      }% dos alunos`
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            {/* Receita do Mês - apenas para administradores */}
            {user && user.cargo === 'administrador' && (
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#fff3e0", color: "#e65100", height: "100%" }}>
                  {renderCardContent("Receita do Mês", estatisticas.receitaMes, loading, "currency")}
                  <CardContent sx={{ pt: 0, pb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {loading ? <Skeleton width="60%" /> : "Pagamentos recebidos no mês atual"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
            <Grid item xs={12} sm={6} md={user && user.cargo === 'administrador' ? 3 : 4}>
              <Card sx={{ bgcolor: "#ffebee", color: "#c62828", height: "100%" }}>
                {renderCardContent(
                  "Pagamentos Pendentes",
                  estatisticas.pagamentosPendentes,
                  loading
                )}
                <CardContent sx={{ pt: 0, pb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {loading ? <Skeleton width="60%" /> : "Alunos com pagamento atrasado"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Gráficos do Dashboard */}
          <DashboardCharts />

          {/* Links rápidos para outras seções */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Acesso Rápido
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {/* Todos os usuários podem acessar Alunos */}
              <Grid item xs={6} sm={3}>
                <Button
                  component={Link}
                  to="/alunos"
                  variant="outlined"
                  startIcon={<Person />}
                  fullWidth
                  sx={{
                    height: "100%",
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box sx={{ mb: 1 }}>
                    <FitnessCenter sx={{ fontSize: 32 }} />
                  </Box>
                  Alunos
                </Button>
              </Grid>
              
              {/* Somente administradores podem acessar Planos */}
              {user && user.cargo === 'administrador' && (
                <Grid item xs={6} sm={3}>
                  <Button
                    component={Link}
                    to="/planos"
                    variant="outlined"
                    startIcon={<DirectionsRun />}
                    fullWidth
                    sx={{
                      height: "100%",
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box sx={{ mb: 1 }}>
                      <Paid sx={{ fontSize: 32 }} />
                    </Box>
                    Planos
                  </Button>
                </Grid>
              )}
              
              {/* Somente administradores e instrutores podem acessar Exercícios */}
              {user && (user.cargo === 'administrador' || user.cargo === 'instrutor') && (
                <Grid item xs={6} sm={3}>
                  <Button
                    component={Link}
                    to="/exercicios"
                    variant="outlined"
                    startIcon={<FitnessCenter />}
                    fullWidth
                    sx={{
                      height: "100%",
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box sx={{ mb: 1 }}>
                      <DirectionsRun sx={{ fontSize: 32 }} />
                    </Box>
                    Exercícios
                  </Button>
                </Grid>
              )}
              
              {/* Somente administradores podem acessar Treinos */}
              {user && user.cargo === 'administrador' && (
                <Grid item xs={6} sm={3}>
                  <Button
                    component={Link}
                    to="/modelos-treino"
                    variant="outlined"
                    startIcon={<CalendarToday />}
                    fullWidth
                    sx={{
                      height: "100%",
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box sx={{ mb: 1 }}>
                      <CalendarToday sx={{ fontSize: 32 }} />
                    </Box>
                    Treinos
                  </Button>
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Informações importantes */}
          <Grid container spacing={3} sx={{ my: 4 }}>
            {/* Lista de aniversariantes */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <CalendarToday color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Aniversariantes do Mês</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {loading ? (
                  <Box sx={{ p: 2 }}>
                    <CircularProgress size={20} sx={{ mr: 2 }} />
                    <Typography variant="body2" component="span">
                      Carregando...
                    </Typography>
                  </Box>
                ) : aniversariantes.length > 0 ? (
                  <List dense>
                    {aniversariantes.map((aluno) => (
                      <ListItem key={aluno.id}>
                        <ListItemIcon>
                          <CalendarToday fontSize="small" color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary={aluno.nome_completo}
                          secondary={`Aniversário: ${aluno.aniversario}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
                    <Info color="info" sx={{ mr: 1 }} />
                    <Typography>Nenhum aniversariante este mês</Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Lista de pagamentos próximos */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Paid color="error" sx={{ mr: 1 }} />
                  <Typography variant="h6">Pagamentos Próximos ao Vencimento</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {loading ? (
                  <Box sx={{ p: 2 }}>
                    <CircularProgress size={20} sx={{ mr: 2 }} />
                    <Typography variant="body2" component="span">
                      Carregando...
                    </Typography>
                  </Box>
                ) : pagamentosProximos.length > 0 ? (
                  <List dense>
                    {pagamentosProximos.map((pagamento) => (
                      <ListItem key={pagamento.id}>
                        <ListItemIcon>
                          <Paid fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary={pagamento.nome_completo}
                          secondary={`Vencimento: ${pagamento.vencimento}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
                    <Info color="info" sx={{ mr: 1 }} />
                    <Typography>Não há pagamentos próximos ao vencimento</Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
}

export default DashboardPage;
