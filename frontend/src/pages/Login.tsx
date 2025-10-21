// frontend/src/pages/Login.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper } from '@mui/material';
import { toast } from 'react-toastify';

interface LoginProps {}

function Login(props: LoginProps): JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      // Login unificado - detecta automaticamente o tipo de usuário
      const tipoUsuarioLogado = await login(email, senha);
      
      // Redireciona com base no tipo de usuário detectado
      if (tipoUsuarioLogado === 'aluno') {
        navigate('/aluno/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast.error(error.response?.data?.error || 'Falha no login. Verifique as suas credenciais.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={6} sx={{ marginTop: 8, padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Typography component="h1" variant="h4" sx={{ fontWeight: "bold", color: "#2E7D32" }}>
            PlankGYM
          </Typography>
          <Typography component="p" variant="body1" sx={{ mt: 1, textAlign: 'center' }}>
            Sistema de Gestão para Academias - Acesso Administrativo
          </Typography>
        </Box>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField 
            margin="normal" 
            required 
            fullWidth 
            id="email" 
            label="Endereço de Email" 
            name="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <TextField 
            margin="normal" 
            required 
            fullWidth 
            name="senha" 
            label="Senha" 
            type="password" 
            id="password" 
            value={senha} 
            onChange={(e) => setSenha(e.target.value)} 
          />
          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            sx={{ mt: 3, mb: 2 }}
          >
            Entrar
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Login;