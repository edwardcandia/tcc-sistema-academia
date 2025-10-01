// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_URL = 'http://localhost:3001/api';

// Função para configurar interceptor do Axios para tratar tokens expirados
const setupAxiosInterceptors = (logout) => {
  axios.interceptors.response.use(
    response => response,
    error => {
      // Se o erro é 401 (Não autorizado), pode ser token expirado
      if (error.response && error.response.status === 401) {
        // Logout automático apenas se o erro for de token inválido ou expirado
        if (error.response.data && 
            (error.response.data.error === 'Token inválido ou expirado.' || 
             error.response.data.error === 'Token não fornecido.')) {
          logout();
        }
      }
      return Promise.reject(error);
    }
  );
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [aluno, setAluno] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Efeito para verificar a autenticação ao carregar a página
  useEffect(() => {
    const checkAuthStatus = async () => {
      setLoading(true);
      
      // Carregar dados do localStorage ao inicializar
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedAluno = localStorage.getItem('aluno');
      
      if (storedToken) {
        setToken(storedToken);
        
        try {
          // Verificar se o token ainda é válido fazendo uma requisição para o servidor
          const response = await axios.get(`${API_URL}/auth/verify-token`, {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          
          if (response.data.valid) {
            if (storedUser) {
              setUser(JSON.parse(storedUser));
            } else if (storedAluno) {
              setAluno(JSON.parse(storedAluno));
            }
          } else {
            // Se o token não for válido, fazer logout
            logout();
          }
        } catch (error) {
          console.warn('Erro ao verificar token, mantendo dados de autenticação:', error);
          // Mesmo com erro, manteremos os dados locais para evitar logout desnecessário
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else if (storedAluno) {
            setAluno(JSON.parse(storedAluno));
          }
        }
      }
      
      setLoading(false);
    };
    
    checkAuthStatus();
  }, []);
  
  // Configurar o interceptor do Axios para tratar tokens expirados
  useEffect(() => {
    setupAxiosInterceptors(logout);
  }, []);

  // --- FUNÇÃO DE LOGIN ATUALIZADA ---
  const login = async (email, senha) => {
    try {
      // Sempre chama a mesma rota unificada
      const response = await axios.post(`${API_URL}/login`, { email, senha });
      
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
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
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
    <AuthContext.Provider value={{ user, aluno, token, login, logout, authHeader, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);