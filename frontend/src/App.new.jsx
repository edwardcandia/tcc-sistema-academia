// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Importações diretas em vez de lazy
import DashboardPage from './pages/DashboardPage';
import AlunosPage from './pages/AlunosPage';
import PlanosPage from './pages/PlanosPage';
import RelatoriosPage from './pages/RelatoriosPage';
import ExerciciosPage from './pages/ExerciciosPage';
import AlunoLoginPage from './pages/AlunoLoginPage';
import AlunoDashboardPage from './pages/AlunoDashboardPage';
import ModelosTreinoPage from './pages/ModelosTreinoPage';
import ModeloTreinoDetalhePage from './pages/ModeloTreinoDetalhePage';
import AlunoTreinoDetalhePage from './pages/AlunoTreinoDetalhePage';

function PrivateRoute({ children, roles }) {
  const { token, user } = useAuth();
  if (!token || !user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.cargo)) return <Navigate to="/dashboard" />;
  return children;
}

function AlunoPrivateRoute({ children }) {
  const { token, aluno } = useAuth();
  return (token && aluno) ? children : <Navigate to="/login" />;
}

// Componente de loading
const LoadingComponent = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <ErrorBoundary>
      <Routes>
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
          <Route path="relatorios" element={
            <PrivateRoute roles={['administrador']}>
              <RelatoriosPage />
            </PrivateRoute>
          } />
          <Route path="exercicios" element={
            <PrivateRoute roles={['administrador']}>
              <ExerciciosPage />
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
        <Route path="/aluno/login" element={<Navigate to="/login" />} /> {/* Redireciona para o login unificado */}
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
  );
}

export default App;