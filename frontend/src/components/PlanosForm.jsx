// frontend/src/components/PlanosForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { TextField, Button, Box, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext'; // 1. Importar o hook de autenticação

function PlanosForm({ onPlanoAdicionado }) {
  const { authHeader } = useAuth(); // 2. Obter a função que retorna o header com o token
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!nome || !valor) {
      toast.error('Nome e valor são obrigatórios!');
      return;
    }
    try {
      const novoPlano = { nome, valor: parseFloat(valor), descricao };
      // 3. Adicionar o authHeader() na requisição POST
      await axios.post('http://localhost:3001/api/planos', novoPlano, authHeader());
      toast.success('Plano cadastrado com sucesso!');
      setNome('');
      setValor('');
      setDescricao('');
      onPlanoAdicionado();
    } catch (error) {
      console.error('Erro ao cadastrar plano:', error);
      toast.error('Falha ao cadastrar o plano.');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4, p: 2, border: '1px solid #ddd', borderRadius: '8px' }}
    >
      <Typography variant="h6">Cadastrar Novo Plano</Typography>
      <TextField
        label="Nome do Plano"
        variant="outlined"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
      />
      <TextField
        label="Valor (R$)"
        variant="outlined"
        type="number"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        required
      />
      <TextField
        label="Descrição"
        variant="outlined"
        multiline
        rows={2}
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
      />
      <Button type="submit" variant="contained" color="primary">
        Cadastrar Plano
      </Button>
    </Box>
  );
}

export default PlanosForm;