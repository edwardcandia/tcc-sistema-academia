// frontend/src/debug_login.js
// Script para testar o login do frontend

import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
const EMAIL_ALUNO = 'lifee.mari@gmail.com';
const SENHA_ALUNO = '123456';

// Função para simular o login do aluno
async function testAlunoLogin() {
  try {
    console.log('Tentando login como aluno...');
    
    const response = await axios.post(`${API_URL}/login`, {
      email: EMAIL_ALUNO,
      senha: SENHA_ALUNO
    });
    
    console.log('Login bem-sucedido!');
    console.log('Resposta:', response.data);
    
    const { token, aluno } = response.data;
    
    if (token && aluno) {
      // Salvar dados no localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('aluno', JSON.stringify(aluno));
      
      console.log('Dados salvos no localStorage');
      console.log('Token:', token);
      console.log('Aluno:', aluno);
      
      // Tentar acessar rota protegida
      try {
        const protectedResponse = await axios.get(`${API_URL}/portal/meus-dados`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Acesso a rota protegida bem-sucedido!');
        console.log('Dados do aluno:', protectedResponse.data);
        
      } catch (error) {
        console.error('Erro ao acessar rota protegida:', error.response?.data || error.message);
      }
    } else {
      console.error('Token ou dados do aluno não retornados pelo servidor');
    }
    
  } catch (error) {
    console.error('Erro no login:', error.response?.data || error.message);
  }
}

// Executar o teste
testAlunoLogin();