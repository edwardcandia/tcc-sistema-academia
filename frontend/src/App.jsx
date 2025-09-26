// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import AlunosPage from './pages/AlunosPage';
import PlanosPage from './pages/PlanosPage';
import RelatoriosPage from './pages/RelatoriosPage';
import { useAuth } from './context/AuthContext';

function PrivateRoute({ children, roles }) {
  const { token, user } = useAuth();
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (roles && !roles.includes(user?.cargo)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="alunos" element={<AlunosPage />} />
        <Route path="planos" element={<PrivateRoute roles={['administrador']}><PlanosPage /></PrivateRoute>} />
        <Route path="relatorios" element={<PrivateRoute roles={['administrador']}><RelatoriosPage /></PrivateRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;