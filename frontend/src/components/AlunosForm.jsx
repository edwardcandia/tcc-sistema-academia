// frontend/src/components/AlunosForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { TextField, Button, Box, Typography, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { useAuth } from '../context/AuthContext'; // 1. GARANTA QUE ESTE IMPORT ESTÁ AQUI

function AlunosForm({ planos, onAlunoAdicionado }) {
  const { authHeader } = useAuth(); // 2. GARANTA QUE ESTA LINHA ESTÁ AQUI
  const [formData, setFormData] = useState({
    nome_completo: '',
    cpf: '',
    email: '',
    telefone: '',
    data_nascimento: '',
    plano_id: '',
    status: 'ativo',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 3. GARANTA QUE authHeader() está no final da chamada do axios.post
      await axios.post('http://localhost:3001/api/alunos', formData, authHeader());
      toast.success('Aluno cadastrado com sucesso!');
      onAlunoAdicionado();
      setFormData({
        nome_completo: '', cpf: '', email: '', telefone: '', data_nascimento: '', plano_id: '', status: 'ativo',
      });
    } catch (error) {
      toast.error(`Falha ao cadastrar aluno: ${error.response?.data?.error || 'Erro desconhecido'}`);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4, p: 2, border: '1px solid #ddd', borderRadius: '8px' }}
    >
      <Typography variant="h6">Cadastrar Novo Aluno</Typography>
      <TextField name="nome_completo" label="Nome Completo" value={formData.nome_completo} onChange={handleChange} required />
      <TextField name="cpf" label="CPF" value={formData.cpf} onChange={handleChange} required />
      <TextField name="email" type="email" label="Email" value={formData.email} onChange={handleChange} required />
      <TextField name="telefone" label="Telefone" value={formData.telefone} onChange={handleChange} />
      <TextField name="data_nascimento" label="Data de Nascimento" type="date" value={formData.data_nascimento} onChange={handleChange} required InputLabelProps={{ shrink: true }} />
      
      <FormControl fullWidth required>
        <InputLabel id="plano-select-label">Plano</InputLabel>
        <Select
          labelId="plano-select-label"
          name="plano_id"
          value={formData.plano_id}
          label="Plano"
          onChange={handleChange}
        >
          <MenuItem value=""><em>Selecione um Plano</em></MenuItem>
          {planos.map(plano => (
            <MenuItem key={plano.id} value={plano.id}>
              {plano.nome}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <FormControl fullWidth>
        <InputLabel id="status-select-label">Status</InputLabel>
        <Select
          labelId="status-select-label"
          name="status"
          value={formData.status}
          label="Status"
          onChange={handleChange}
        >
          <MenuItem value="ativo">Ativo</MenuItem>
          <MenuItem value="inativo">Inativo</MenuItem>
        </Select>
      </FormControl>
      
      <Button type="submit" variant="contained" color="primary">
        Cadastrar Aluno
      </Button>
    </Box>
  );
}

export default AlunosForm;