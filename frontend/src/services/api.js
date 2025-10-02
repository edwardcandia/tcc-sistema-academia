// frontend/src/services/api.js

// URL base da API
export const API_URL = 'http://localhost:3001';

// Função para configurar headers com token de autenticação
export const getAuthHeader = (token) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Função para obter o token de administrador/funcionário do localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Função para obter o token de aluno do localStorage
export const getAlunoToken = () => {
  return localStorage.getItem('alunoToken');
};

// Função para obter o header adequado baseado no tipo de usuário (admin/aluno)
export const getAppropriateAuthHeader = () => {
  const adminToken = getToken();
  const alunoToken = getAlunoToken();
  
  if (adminToken) {
    return getAuthHeader(adminToken);
  } else if (alunoToken) {
    return getAuthHeader(alunoToken);
  }
  
  return {};
};