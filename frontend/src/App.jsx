import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import { useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/ToastProvider';
import ErrorBoundary from './components/ErrorBoundary';
import theme from './theme';

import Layout from './components/Layout';
import Login from './pages/Login';
import DashboardPage from './pages/DashboardPage';
import AlunosPage from './pages/AlunosPage';
import PlanosPage from './pages/PlanosPage';
import ExerciciosPage from './pages/ExerciciosPage';
import ModelosTreinoPage from './pages/ModelosTreinoPage';
import ModeloTreinoDetalhePage from './pages/ModeloTreinoDetalhePage';
import NotificacoesAutomaticasPage from './pages/NotificacoesAutomaticasPage';
import InadimplentesPage from './pages/InadimplentesPage';
import UsuariosPage from './pages/UsuariosPage';
import AlunoLoginPage from './pages/AlunoLoginPage';
import AlunoDashboardPage from './pages/AlunoDashboardPage';
import AlunoTreinoDetalhePage from './pages/AlunoTreinoDetalhePage';

function PrivateRoute({ children, roles, alunoOnly = false }) {
  const { token, user, aluno } = useAuth();
  
  // Se não está autenticado, redireciona para o login apropriado
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  // Se a rota é exclusiva para aluno
  if (alunoOnly) {
    if (!aluno) return <Navigate to="/login" />;
    return children;
  }
  
  // Se a rota é para admin/atendente
  if (!user) return <Navigate to="/aluno-login" />;
  if (roles && !roles.includes(user.cargo)) return <Navigate to="/dashboard" />;
  return children;
}

const LoadingSpinner = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

function App() {
  const { loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/aluno-login" element={<AlunoLoginPage />} />
            
            {/* Rotas do Painel do Aluno */}
            <Route path="/aluno/dashboard" element={
              <PrivateRoute alunoOnly={true}><AlunoDashboardPage /></PrivateRoute>
            } />
            <Route path="/aluno/treinos/:id" element={
              <PrivateRoute alunoOnly={true}><AlunoTreinoDetalhePage /></PrivateRoute>
            } />

            {/* Rotas Admin/Atendente */}
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="alunos" element={<AlunosPage />} />
              <Route path="planos" element={
                <PrivateRoute roles={['administrador']}><PlanosPage /></PrivateRoute>
              } />
              <Route path="exercicios" element={
                <PrivateRoute roles={['administrador']}><ExerciciosPage /></PrivateRoute>
              } />
              <Route path="notificacoes-automaticas" element={
                <PrivateRoute roles={['administrador']}><NotificacoesAutomaticasPage /></PrivateRoute>
              } />
              <Route path="inadimplentes" element={
                <PrivateRoute roles={['administrador', 'atendente']}><InadimplentesPage /></PrivateRoute>
              } />
              <Route path="modelos-treino" element={
                <PrivateRoute roles={['administrador']}><ModelosTreinoPage /></PrivateRoute>
              } />
              <Route path="modelos-treino/:id" element={
                <PrivateRoute roles={['administrador']}><ModeloTreinoDetalhePage /></PrivateRoute>
              } />
              <Route path="usuarios" element={
                <PrivateRoute roles={['administrador']}><UsuariosPage /></PrivateRoute>
              } />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </ErrorBoundary>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;