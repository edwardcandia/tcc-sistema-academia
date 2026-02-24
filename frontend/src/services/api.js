// Base sem /api — usada por contextos que precisam montar a URL manualmente
export const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

// Base com /api — use isso nos componentes para chamadas à API
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const getAuthHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

export const getToken = () => localStorage.getItem('token');