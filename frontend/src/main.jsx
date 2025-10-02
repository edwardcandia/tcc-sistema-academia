import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

// Adiciona handler de erro global
window.addEventListener('error', (event) => {
  console.error('Erro global capturado:', event.error);
  
  // Cria um elemento para mostrar o erro
  const errorDiv = document.createElement('div');
  errorDiv.style.position = 'fixed';
  errorDiv.style.top = '0';
  errorDiv.style.left = '0';
  errorDiv.style.right = '0';
  errorDiv.style.padding = '20px';
  errorDiv.style.backgroundColor = '#f44336';
  errorDiv.style.color = 'white';
  errorDiv.style.zIndex = '9999';
  errorDiv.innerHTML = `<strong>Erro:</strong> ${event.error?.message || 'Ocorreu um erro desconhecido'} <br>
                        <a href="/simple.html" style="color:white;text-decoration:underline">Ir para modo simplificado</a>`;
  
  document.body.prepend(errorDiv);
});

// Adiciona uma mensagem para debug
console.log('Iniciando renderização do aplicativo...');

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>,
  );
  console.log('Renderização concluída com sucesso!');
} catch (error) {
  console.error('Erro durante a renderização:', error);
  
  // Renderiza uma página de erro simples
  document.body.innerHTML = `
    <div style="text-align:center;padding:50px;">
      <h1>Erro ao carregar o aplicativo</h1>
      <p>${error.message}</p>
      <p><a href="/simple.html">Ir para versão simplificada</a></p>
    </div>
  `;
}