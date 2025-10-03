// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

// Context providers
import { useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/ToastProvider';
import ErrorBoundary from './components/ErrorBoundary';

// Theme
import theme from './theme';

// Layout components
import Layout from './components/Layout';
import Login from './pages/Login';

// Importações diretas em vez de lazy
import DashboardPage from './pages/DashboardPage';
import AlunosPage from './pages/AlunosPage';
import PlanosPage from './pages/PlanosPage';
import ExerciciosPage from './pages/ExerciciosPage';
import AlunoLoginPage from './pages/AlunoLoginPage';
import AlunoDashboardPage from './pages/AlunoDashboardPage';
import ModelosTreinoPage from './pages/ModelosTreinoPage';
import ModeloTreinoDetalhePage from './pages/ModeloTreinoDetalhePage';
import AlunoTreinoDetalhePage from './pages/AlunoTreinoDetalhePage';
import NotificacoesAutomaticasPage from './pages/NotificacoesAutomaticasPage';
import SimplePage from './pages/SimplePage';

function PrivateRoute({ children, roles }) {
  const { token, user } = useAuth();
  if (!token || !user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.cargo)) return <Navigate to="/dashboard" />;
  return children;
}

function AlunoPrivateRoute({ children }) {
  const { token, aluno } = useAuth();
  
  console.log('AlunoPrivateRoute - token:', token ? 'Presente' : 'Ausente');
  console.log('AlunoPrivateRoute - aluno:', aluno);
  
  // Se não tem token ou dados do aluno, redireciona para o login
  if (!token || !aluno) {
    console.log('Redirecionando para /aluno/login - Não autorizado');
    return <Navigate to="/aluno/login" />;
  }
  
  // Se tiver tudo correto, renderiza as rotas protegidas
  return children;
}

// Componente de loading
const LoadingComponent = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>
        <ErrorBoundary>
          <Routes>
            {/* Página inicial simples para diagnóstico */}
            <Route path="/simple" element={<SimplePage />} />
        
        {/* Rotas de Admin/Atendente */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="alunos" element={<AlunosPage />} />
          <Route path="planos" element={
            <PrivateRoute roles={['administrador']}>
              <PlanosPage />
            </PrivateRoute>
          } />

          <Route path="exercicios" element={
            <PrivateRoute roles={['administrador']}>
              <ExerciciosPage />
            </PrivateRoute>
          } />

          {/* Rota de notificações automatizadas */}
          <Route path="notificacoes-automaticas" element={
            <PrivateRoute roles={['administrador']}>
              <NotificacoesAutomaticasPage />
            </PrivateRoute>
          } />

          {/* ROTAS DE MODELOS DE TREINO */}
          <Route path="modelos-treino" element={
            <PrivateRoute roles={['administrador']}>
              <ModelosTreinoPage />
            </PrivateRoute>
          } />
          <Route path="modelos-treino/:id" element={
            <PrivateRoute roles={['administrador']}>
              <ModeloTreinoDetalhePage />
            </PrivateRoute>
          } />
        </Route>

        {/* Rotas do Portal do Aluno */}
        <Route path="/aluno/login" element={<AlunoLoginPage />} /> {/* Página de login específica para alunos */}
        <Route path="/aluno/dashboard" element={
          <AlunoPrivateRoute>
            <AlunoDashboardPage />
          </AlunoPrivateRoute>
        } />
        <Route path="/aluno/treinos/:id" element={
          <AlunoPrivateRoute>
            <AlunoTreinoDetalhePage />
          </AlunoPrivateRoute>
        } />

        {/* Rota Padrão */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
        </ErrorBoundary>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;