// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import AlunosPage from './pages/AlunosPage';
import PlanosPage from './pages/PlanosPage';
import RelatoriosPage from './pages/RelatoriosPage';
import AlunoLoginPage from './pages/AlunoLoginPage'; // Importado
import AlunoDashboardPage from './pages/AlunoDashboardPage'; // Importado
import { useAuth } from './context/AuthContext';

// Protege rotas de Admin/Atendente
function PrivateRoute({ children, roles }) {
  const { token, user } = useAuth();
  if (!token || !user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.cargo)) return <Navigate to="/dashboard" />;
  return children;
}

// Protege rotas de Aluno
function AlunoPrivateRoute({ children }) {
    const { token, aluno } = useAuth();
    return (token && aluno) ? children : <Navigate to="/aluno/login" />;
}

function App() {
  return (
    <Routes>
      {/* Rotas de Admin/Atendente */}
      <Route path="/login" element={<Login />} />
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

      {/* Rota padrão */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;