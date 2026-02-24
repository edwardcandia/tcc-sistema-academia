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

function PrivateRoute({ children, roles }) {
  const { token, user } = useAuth();
  if (!token || !user) return <Navigate to="/login" />;
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