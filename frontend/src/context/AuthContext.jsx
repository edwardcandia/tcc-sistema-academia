import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [aluno, setAluno] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('aluno');
    setToken(null);
    setUser(null);
    setAluno(null);
  }, []);

  // Restore session from localStorage and validate token with server
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(`${API_URL}/auth/verify-token`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        });

        if (data.valid) {
          setToken(storedToken);
          const storedUser = localStorage.getItem('user');
          const storedAluno = localStorage.getItem('aluno');
          if (storedUser) setUser(JSON.parse(storedUser));
          else if (storedAluno) setAluno(JSON.parse(storedAluno));
        } else {
          logout();
        }
      } catch {
        // Network error: keep local session to avoid unnecessary logouts
        const storedUser = localStorage.getItem('user');
        const storedAluno = localStorage.getItem('aluno');
        setToken(storedToken);
        if (storedUser) setUser(JSON.parse(storedUser));
        else if (storedAluno) setAluno(JSON.parse(storedAluno));
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [logout]);

  // Auto-logout on 401 responses with token error messages
  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      response => response,
      error => {
        const msg = error.response?.data?.error || error.response?.data?.message || '';
        if (error.response?.status === 401 && (msg.includes('Token') || msg.includes('token'))) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptorId);
  }, [logout]);

  const login = async (email, senha) => {
    const { data } = await axios.post(`${API_URL}/login`, { email, senha });
    const { token: newToken, user: userData, aluno: alunoData } = data;

    localStorage.setItem('token', newToken);
    setToken(newToken);

    if (alunoData) {
      localStorage.setItem('aluno', JSON.stringify(alunoData));
      setAluno(alunoData);
      setUser(null);
      localStorage.removeItem('user');
      return 'aluno';
    }

    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setAluno(null);
    localStorage.removeItem('aluno');
    return 'user';
  };

  const authHeader = () =>
    token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  return (
    <AuthContext.Provider value={{ user, aluno, token, login, logout, authHeader, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);