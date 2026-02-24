// frontend/src/components/AlunosForm.jsx
import React, { useState, forwardRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { TextField, Button, Box, Typography, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { IMaskInput } from 'react-imask';
import { API_BASE } from '../services/api';

// --- Adaptadores para as máscaras ---
const CpfMask = forwardRef(function CpfMask(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="000.000.000-00"
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

const TelefoneMask = forwardRef(function TelefoneMask(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="(00) 00000-0000"
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

function AlunosForm({ planos, onAlunoAdicionado }) {
  const { authHeader } = useAuth();
  const [formData, setFormData] = useState({
    nome_completo: '', cpf: '', email: '', telefone: '', data_nascimento: '', plano_id: '', status: 'ativo',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/alunos`, formData, authHeader());
      toast.success('Aluno cadastrado com sucesso!');
      onAlunoAdicionado();
      setFormData({
        nome_completo: '', cpf: '', email: '', telefone: '', data_nascimento: '', plano_id: '', status: 'ativo',
      });
    } catch (error) {
      // Tenta pegar a mensagem do backend (campo 'message' no novo formato, 'error' no legado)
      const msg = error.response?.data?.message || error.response?.data?.error || 'Erro desconhecido';
      toast.error(`Falha ao cadastrar aluno: ${msg}`);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4, p: 2, border: '1px solid #ddd', borderRadius: '8px' }}>
      <Typography variant="h6">Cadastrar Novo Aluno</Typography>
      <TextField name="nome_completo" label="Nome Completo" value={formData.nome_completo} onChange={handleChange} required />
      <TextField name="cpf" label="CPF" value={formData.cpf} onChange={handleChange} required InputProps={{ inputComponent: CpfMask }} />
      <TextField name="email" type="email" label="Email" value={formData.email} onChange={handleChange} required />
      <TextField name="telefone" label="Telefone" value={formData.telefone} onChange={handleChange} InputProps={{ inputComponent: TelefoneMask }} />
      <TextField name="data_nascimento" label="Data de Nascimento" type="date" value={formData.data_nascimento} onChange={handleChange} required InputLabelProps={{ shrink: true }} />
      <FormControl fullWidth required>
        <InputLabel>Plano</InputLabel>
        <Select name="plano_id" value={formData.plano_id} label="Plano" onChange={handleChange}>
          <MenuItem value=""><em>Selecione um Plano</em></MenuItem>
          {planos.map(plano => (<MenuItem key={plano.id} value={plano.id}>{plano.nome}</MenuItem>))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>Status</InputLabel>
        <Select name="status" value={formData.status} label="Status" onChange={handleChange}>
          <MenuItem value="ativo">Ativo</MenuItem>
          <MenuItem value="inativo">Inativo</MenuItem>
        </Select>
      </FormControl>
      <Button type="submit" variant="contained" color="primary">Cadastrar Aluno</Button>
    </Box>
  );
}

export default AlunosForm;