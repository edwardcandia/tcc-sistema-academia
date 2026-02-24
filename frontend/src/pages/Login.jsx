import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper } from '@mui/material';
import { toast } from 'react-toastify';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, senha);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Falha no login. Verifique suas credenciais.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={6} sx={{ marginTop: 8, padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <img 
            src="/assets/logos/plankgym/logo-main.png" 
            alt="PlankGYM Logo" 
            style={{ height: "120px", marginBottom: "16px" }} 
          />
          <Typography component="h1" variant="h4" sx={{ fontWeight: "bold", color: "#2E7D32" }}>
            PlankGYM
          </Typography>
          <Typography component="p" variant="body1" sx={{ mt: 1, textAlign: 'center' }}>
            Sistema de Gestão para Academias - Acesso Administrativo
          </Typography>
        </Box>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField margin="normal" required fullWidth id="email" label="Endereço de Email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField margin="normal" required fullWidth name="senha" label="Senha" type="password" id="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Entrar
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Login;