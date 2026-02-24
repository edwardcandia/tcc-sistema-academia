import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

window.addEventListener('error', (event) => {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;padding:20px;background:#f44336;color:white;z-index:9999';
  errorDiv.textContent = `Erro: ${event.error?.message || 'Ocorreu um erro desconhecido'}`;
  document.body.prepend(errorDiv);
});

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
} catch (error) {
  console.error('Erro durante a renderização:', error);
  document.body.innerHTML = `
    <div style="text-align:center;padding:50px;">
      <h1>Erro ao carregar o aplicativo</h1>
      <p>${error.message}</p>
    </div>
  `;
}