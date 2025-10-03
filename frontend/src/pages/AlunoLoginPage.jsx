// frontend/src/pages/AlunoLoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper } from '@mui/material';
import { toast } from 'react-toastify';

function AlunoLoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Passamos o email e senha para a função de login (o parâmetro tipo não é mais necessário)
      await login(email, senha); 
      navigate('/aluno/dashboard'); // Redireciona para o dashboard DO ALUNO
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Falha no login. Verifique as suas credenciais ou se a sua senha já foi definida.');
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
            Portal do Aluno - Login
          </Typography>
        </Box>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField margin="normal" required fullWidth id="email" label="Seu Email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField margin="normal" required fullWidth name="senha" label="Sua Senha" type="password" id="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Entrar
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default AlunoLoginPage;