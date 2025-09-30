// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Para admin/atendente
  const [aluno, setAluno] = useState(null); // Para aluno
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedAluno = localStorage.getItem('aluno');
    if (storedToken) {
      setToken(storedToken);
      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedAluno) setAluno(JSON.parse(storedAluno));
    }
  }, []);

  const login = async (email, senha, tipo = 'user') => {
    const url = tipo === 'aluno' 
      ? 'http://localhost:3001/api/portal/login' 
      : 'http://localhost:3001/api/auth/login';
      
    const response = await axios.post(url, { email, senha });
    
    const { token, user: userData, aluno: alunoData } = response.data;

    localStorage.setItem('token', token);
    setToken(token);

    if (tipo === 'aluno') {
      localStorage.setItem('aluno', JSON.stringify(alunoData));
      setAluno(alunoData);
      setUser(null); // Garante que não há login de admin/atendente ao mesmo tempo
      localStorage.removeItem('user');
    } else {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setAluno(null); // Garante que não há login de aluno ao mesmo tempo
      localStorage.removeItem('aluno');
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setAluno(null);
    setToken(null);
  };

  const authHeader = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  return (
    <AuthContext.Provider value={{ user, aluno, token, login, logout, authHeader }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);