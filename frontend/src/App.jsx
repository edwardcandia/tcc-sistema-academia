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

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Rotas Protegidas que usarão o Layout */}
      <Route 
        path="/" 
        element={<PrivateRoute><Layout /></PrivateRoute>}
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="alunos" element={<AlunosPage />} />
        <Route path="planos" element={<PlanosPage />} />
        <Route path="relatorios" element={<RelatoriosPage />} />
      </Route>

      {/* Rota para qualquer outro caminho */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;