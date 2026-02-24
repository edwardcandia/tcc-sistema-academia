import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, CircularProgress, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LockResetIcon from '@mui/icons-material/LockReset';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const CARGOS = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'atendente',     label: 'Atendente'     },
];

const CARGO_COLOR = { administrador: 'primary', atendente: 'default' };

function NovoUsuarioDialog({ open, onClose, onSaved, authHeader }) {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', cargo: 'atendente' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.nome || !form.email || !form.senha || !form.cargo) {
      setError('Preencha todos os campos.');
      return;
    }
    if (form.senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/auth/register`, form, authHeader());
      toast.success(`Usuário "${form.nome}" criado com sucesso!`);
      setForm({ nome: '', email: '', senha: '', cargo: 'atendente' });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar usuário.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ nome: '', email: '', senha: '', cargo: 'atendente' });
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Novo Usuário</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Nome completo" name="nome" value={form.nome} onChange={handleChange} required fullWidth />
        <TextField label="E-mail" name="email" type="email" value={form.email} onChange={handleChange} required fullWidth />
        <TextField label="Senha" name="senha" type="password" value={form.senha} onChange={handleChange}
          helperText="Mínimo 6 caracteres" required fullWidth />
        <TextField select label="Cargo" name="cargo" value={form.cargo} onChange={handleChange} fullWidth>
          {CARGOS.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ResetSenhaDialog({ open, usuario, onClose, authHeader }) {
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (senha.length < 6) { setError('Mínimo 6 caracteres.'); return; }
    setLoading(true); setError('');
    try {
      await axios.patch(`${API_URL}/usuarios/${usuario.id}/senha`, { senha }, authHeader());
      toast.success('Senha redefinida com sucesso!');
      setSenha('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao redefinir senha.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => { setSenha(''); setError(''); onClose(); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Redefinir Senha — {usuario?.nome}</DialogTitle>
      <DialogContent sx={{ pt: '16px !important' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField label="Nova senha" type="password" value={senha} onChange={e => setSenha(e.target.value)}
          helperText="Mínimo 6 caracteres" fullWidth autoFocus />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Redefinir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function UsuariosPage() {
  const { authHeader, user: me } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novoOpen, setNovoOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/usuarios`, authHeader());
      setUsuarios(data);
    } catch (err) {
      toast.error('Erro ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);

  const handleDelete = async (usuario) => {
    if (!window.confirm(`Excluir o usuário "${usuario.nome}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await axios.delete(`${API_URL}/usuarios/${usuario.id}`, authHeader());
      toast.success(`Usuário "${usuario.nome}" removido.`);
      setUsuarios(prev => prev.filter(u => u.id !== usuario.id));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao excluir usuário.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PersonIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">Usuários do Sistema</Typography>
            <Typography variant="body2" color="text.secondary">
              Gerencie administradores e atendentes
            </Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setNovoOpen(true)}>
          Novo Usuário
        </Button>
      </Box>

      {/* Tabela */}
      <Paper elevation={2}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Nome</strong></TableCell>
                  <TableCell><strong>E-mail</strong></TableCell>
                  <TableCell><strong>Cargo</strong></TableCell>
                  <TableCell align="right"><strong>Ações</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  usuarios.map(u => (
                    <TableRow key={u.id} hover sx={{ opacity: u.id === me?.id ? 0.75 : 1 }}>
                      <TableCell>
                        {u.nome}
                        {u.id === me?.id && (
                          <Chip label="Você" size="small" sx={{ ml: 1 }} />
                        )}
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={CARGOS.find(c => c.value === u.cargo)?.label || u.cargo}
                          color={CARGO_COLOR[u.cargo] || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Redefinir senha">
                          <IconButton size="small" onClick={() => setResetTarget(u)}>
                            <LockResetIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={u.id === me?.id ? 'Você não pode excluir sua própria conta' : 'Excluir usuário'}>
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={u.id === me?.id}
                              onClick={() => handleDelete(u)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <NovoUsuarioDialog
        open={novoOpen}
        onClose={() => setNovoOpen(false)}
        onSaved={() => { setNovoOpen(false); fetchUsuarios(); }}
        authHeader={authHeader}
      />

      <ResetSenhaDialog
        open={Boolean(resetTarget)}
        usuario={resetTarget}
        onClose={() => setResetTarget(null)}
        authHeader={authHeader}
      />
    </Box>
  );
}
