import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Skeleton, Alert, IconButton, Tooltip, Modal, TextField, Button
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PaymentIcon from '@mui/icons-material/Payment';
import PhoneIcon from '@mui/icons-material/Phone';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../services/api';

const styleModal = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 440 },
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 3,
};

// Chip de urgência baseado nos dias de atraso
function ChipAtraso({ dias }) {
  const d = parseInt(dias, 10);
  if (d > 30) return <Chip label={`${d}d atrasado`} color="error" size="small" />;
  if (d > 14) return <Chip label={`${d}d atrasado`} color="warning" size="small" />;
  return <Chip label={`${d}d atrasado`} sx={{ bgcolor: '#fff3e0', color: '#e65100' }} size="small" />;
}

function InadimplentesPanel({ compact = false, onPaymentRegistered }) {
  const { authHeader } = useAuth();
  const [inadimplentes, setInadimplentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagamentoModal, setPagamentoModal] = useState({ open: false, aluno: null, valor: '' });

  const fetchInadimplentes = useCallback(async () => {
    if (!authHeader) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/dashboard/inadimplentes`, authHeader());
      setInadimplentes(data);
    } catch (err) {
      console.error('Erro ao buscar inadimplentes:', err);
    } finally {
      setLoading(false);
    }
  }, [authHeader]);

  useEffect(() => { fetchInadimplentes(); }, [fetchInadimplentes]);

  const abrirPagamento = (aluno) => {
    setPagamentoModal({ open: true, aluno, valor: aluno.valor_plano || '' });
  };

  const fecharPagamento = () => {
    setPagamentoModal({ open: false, aluno: null, valor: '' });
  };

  const registrarPagamento = async () => {
    const { aluno, valor } = pagamentoModal;
    if (!valor || isNaN(parseFloat(valor))) {
      toast.error('Informe um valor válido.');
      return;
    }
    try {
      await axios.post(
        `${API_BASE}/alunos/${aluno.id}/pagamentos`,
        { valor_pago: parseFloat(valor), data_pagamento: new Date().toISOString().split('T')[0] },
        authHeader()
      );
      toast.success(`Pagamento de ${aluno.nome_completo} registrado!`);
      fecharPagamento();
      fetchInadimplentes();
      onPaymentRegistered?.();
    } catch (err) {
      toast.error('Falha ao registrar pagamento.');
    }
  };

  const totalEmAtraso = inadimplentes
    .reduce((acc, a) => acc + parseFloat(a.valor_plano || 0), 0)
    .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const rows = compact ? inadimplentes.slice(0, 5) : inadimplentes;

  return (
    <>
      {/* Resumo */}
      {!compact && (
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Paper
            variant="outlined"
            sx={{ p: 2, flex: '1 1 180px', borderColor: 'error.main', borderRadius: 2 }}
          >
            <Typography variant="body2" color="text.secondary">Total de inadimplentes</Typography>
            <Typography variant="h4" color="error" fontWeight={700}>
              {loading ? <Skeleton width={40} /> : inadimplentes.length}
            </Typography>
          </Paper>
          <Paper
            variant="outlined"
            sx={{ p: 2, flex: '1 1 220px', borderColor: 'warning.main', borderRadius: 2 }}
          >
            <Typography variant="body2" color="text.secondary">Valor total em atraso</Typography>
            <Typography variant="h5" color="warning.dark" fontWeight={700}>
              {loading ? <Skeleton width={100} /> : totalEmAtraso}
            </Typography>
          </Paper>
        </Box>
      )}

      {loading ? (
        <Box>
          {[1, 2, 3].map(i => <Skeleton key={i} height={48} sx={{ mb: 0.5 }} />)}
        </Box>
      ) : inadimplentes.length === 0 ? (
        <Alert severity="success" icon={<WarningAmberIcon />} sx={{ borderRadius: 2 }}>
          Nenhum aluno com pagamento em atraso. 🎉
        </Alert>
      ) : (
        <>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#fff3e0' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Aluno</TableCell>
                  <TableCell sx={{ fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }}>Plano / Valor</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Atraso</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Vencimento</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((aluno) => (
                  <TableRow
                    key={aluno.id}
                    sx={{
                      '&:hover': { bgcolor: '#fff8f0' },
                      bgcolor: parseInt(aluno.dias_atraso, 10) > 30 ? '#fff5f5' : 'inherit',
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{aluno.nome_completo}</Typography>
                      <Typography variant="caption" color="text.secondary">{aluno.email}</Typography>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Typography variant="body2">{aluno.plano_nome || '—'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {parseFloat(aluno.valor_plano || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <ChipAtraso dias={aluno.dias_atraso} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{aluno.vencimento}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      {aluno.telefone && (
                        <Tooltip title={`WhatsApp: ${aluno.telefone}`}>
                          <IconButton
                            size="small"
                            component="a"
                            href={`https://wa.me/55${aluno.telefone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <PhoneIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Registrar pagamento">
                        <IconButton size="small" color="success" onClick={() => abrirPagamento(aluno)}>
                          <PaymentIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {compact && inadimplentes.length > 5 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              + {inadimplentes.length - 5} outros inadimplentes. Acesse a página de Inadimplência para ver todos.
            </Typography>
          )}
        </>
      )}

      {/* Modal de pagamento rápido */}
      <Modal open={pagamentoModal.open} onClose={fecharPagamento}>
        <Box sx={styleModal}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Registrar Pagamento
          </Typography>
          {pagamentoModal.aluno && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Aluno: <strong>{pagamentoModal.aluno.nome_completo}</strong>
              {' · '}
              <ChipAtraso dias={pagamentoModal.aluno.dias_atraso} />
            </Typography>
          )}
          <TextField
            label="Valor pago (R$)"
            type="number"
            fullWidth
            value={pagamentoModal.valor}
            onChange={(e) => setPagamentoModal(prev => ({ ...prev, valor: e.target.value }))}
            inputProps={{ min: 0, step: '0.01' }}
            sx={{ mb: 3 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={fecharPagamento} color="inherit">Cancelar</Button>
            <Button variant="contained" color="success" onClick={registrarPagamento}>
              Confirmar Pagamento
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

export default InadimplentesPanel;
