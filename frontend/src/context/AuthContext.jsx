// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [aluno, setAluno] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Carregar dados do localStorage ao inicializar
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedAluno = localStorage.getItem('aluno');
    
    if (storedToken) {
      setToken(storedToken);
      
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else if (storedAluno) {
        setAluno(JSON.parse(storedAluno));
      }
    }
  }, []);

  // --- FUNÇÃO DE LOGIN ATUALIZADA ---
  const login = async (email, senha) => {
    // Sempre chama a mesma rota unificada
    const response = await axios.post('http://localhost:3001/api/login', { email, senha });
    
    const { token, user: userData, aluno: alunoData } = response.data;

    localStorage.setItem('token', token);
    setToken(token);

    // Verifica o que o backend retornou para saber quem logou
    if (alunoData) {
      localStorage.setItem('aluno', JSON.stringify(alunoData));
      setAluno(alunoData);
      setUser(null);
      localStorage.removeItem('user');
      return 'aluno'; // Retorna o tipo de usuário logado
    } else {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setAluno(null);
      localStorage.removeItem('aluno');
      return 'user'; // Retorna o tipo de usuário logado
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('aluno');
    setToken(null);
    setUser(null);
    setAluno(null);
  };
  const authHeader = () => {
    // Verificar se o token existe antes de retornar o cabeçalho
    if (!token) {
      console.warn('Tentando usar authHeader, mas o token não existe');
      return {};
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  return (
    <AuthContext.Provider value={{ user, aluno, token, login, logout, authHeader }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);