// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [aluno, setAluno] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => { /* ... (código igual ao anterior, sem alterações) ... */ });

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

  const logout = () => { /* ... (código igual ao anterior, sem alterações) ... */ };
  const authHeader = () => ({ headers: { Authorization: `Bearer ${token}` } });

  return (
    <AuthContext.Provider value={{ user, aluno, token, login, logout, authHeader }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);