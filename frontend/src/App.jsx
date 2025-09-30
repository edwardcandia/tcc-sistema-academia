// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import AlunosPage from './pages/AlunosPage';
import PlanosPage from './pages/PlanosPage';
import RelatoriosPage from './pages/RelatoriosPage';
import AlunoLoginPage from './pages/AlunoLoginPage';
import AlunoDashboardPage from './pages/AlunoDashboardPage';
import { useAuth } from './context/AuthContext';

// --- A FUNÇÃO QUE ESTAVA EM FALTA ESTÁ AQUI ---
// Componente para proteger rotas que exigem login de Admin/Atendente
function PrivateRoute({ children, roles }) {
  const { token, user } = useAuth();
  if (!token || !user) {
    return <Navigate to="/login" />;
  }
  if (roles && !roles.includes(user.cargo)) {
    return <Navigate to="/dashboard" />;
  }
  return children;
}

// --- E A FUNÇÃO PARA PROTEGER AS ROTAS DE ALUNO ---
function AlunoPrivateRoute({ children }) {
    const { token, aluno } = useAuth();
    return (token && aluno) ? children : <Navigate to="/aluno/login" />;
}

function App() {
  return (
    <Routes>
      {/* Rota de Login Unificada */}
      <Route path="/login" element={<Login />} />
      
      {/* Rotas de Admin/Atendente dentro do Layout */}
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="alunos" element={<AlunosPage />} />
        <Route path="planos" element={<PrivateRoute roles={['administrador']}><PlanosPage /></PrivateRoute>} />
        <Route path="relatorios" element={<PrivateRoute roles={['administrador']}><RelatoriosPage /></PrivateRoute>} />
      </Route>

      {/* Rotas do Portal do Aluno */}
      <Route path="/aluno/login" element={<AlunoLoginPage />} />
      <Route path="/aluno/dashboard" element={<AlunoPrivateRoute><AlunoDashboardPage /></AlunoPrivateRoute>} />

      {/* Rota Padrão para qualquer outro caminho */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;