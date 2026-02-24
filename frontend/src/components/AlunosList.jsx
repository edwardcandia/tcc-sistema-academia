import React, { useState, forwardRef } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, TextField, Box, Typography, Select, MenuItem, FormControl, InputLabel,
  Modal, Button, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentIcon from '@mui/icons-material/Payment';
import HistoryIcon from '@mui/icons-material/History';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { IMaskInput } from 'react-imask';
import { API_BASE } from '../services/api';

// --- Adaptadores para as máscaras ---
const CpfMask = forwardRef(function CpfMask(props, ref) {
  const { onChange, ...other } = props;
  return ( <IMaskInput {...other} mask="000.000.000-00" inputRef={ref} onAccept={(value) => onChange({ target: { name: props.name, value } })} overwrite /> );
});
const TelefoneMask = forwardRef(function TelefoneMask(props, ref) {
  const { onChange, ...other } = props;
  return ( <IMaskInput {...other} mask="(00) 00000-0000" inputRef={ref} onAccept={(value) => onChange({ target: { name: props.name, value } })} overwrite /> );
});

const styleModal = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 2
};

function AlunosList({ alunos, planos, onAlunoAtualizado, onAlunoExcluido }) {
  const { authHeader } = useAuth();
  const [pagamentoModalOpen, setPagamentoModalOpen] = useState(false);
  const [alunoParaPagamento, setAlunoParaPagamento] = useState(null);
  const [valorPago, setValorPago] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [alunoParaEditar, setAlunoParaEditar] = useState(null);
  const [historicoModalOpen, setHistoricoModalOpen] = useState(false);
  const [historicoPagamentos, setHistoricoPagamentos] = useState([]);
  const [alunoParaHistorico, setAlunoParaHistorico] = useState(null);

  const handleOpenHistoricoModal = async (aluno) => {
    setAlunoParaHistorico(aluno);
    try {
      const response = await axios.get(`${API_BASE}/alunos/${aluno.id}/pagamentos`, authHeader());
      setHistoricoPagamentos(response.data);
      setHistoricoModalOpen(true);
    } catch (error) {
      toast.error("Falha ao carregar o histórico.");
    }
  };
  const handleCloseHistoricoModal = () => setHistoricoModalOpen(false);

  const handleDeletePagamento = async (pagamentoId) => {
    if (window.confirm('Tem certeza que deseja excluir este pagamento?')) {
        try {
            await axios.delete(`${API_BASE}/pagamentos/${pagamentoId}`, authHeader());
            toast.success('Pagamento excluído com sucesso!');
            handleOpenHistoricoModal(alunoParaHistorico);
            onAlunoAtualizado();
        } catch (error) {
            toast.error('Falha ao excluir o pagamento.');
        }
    }
  };

  const handleOpenPagamentoModal = (aluno) => {
    setAlunoParaPagamento(aluno);
    const planoDoAluno = planos.find(p => p.id === aluno.plano_id);
    setValorPago(planoDoAluno ? planoDoAluno.valor : '');
    setPagamentoModalOpen(true);
  };
  const handleClosePagamentoModal = () => setPagamentoModalOpen(false);

  const handleSubmitPagamento = async (e) => {
    e.preventDefault();
    try {
      const dataPagamento = { valor_pago: parseFloat(valorPago), data_pagamento: new Date().toISOString().split('T')[0] };
      await axios.post(`${API_BASE}/alunos/${alunoParaPagamento.id}/pagamentos`, dataPagamento, authHeader());
      toast.success('Pagamento registrado com sucesso!');
      onAlunoAtualizado();
      handleClosePagamentoModal();
    } catch (error) {
      toast.error('Falha ao registrar pagamento.');
    }
  };
  
  const handleOpenEditModal = (aluno) => {
    const dataFormatada = aluno.data_nascimento ? format(new Date(aluno.data_nascimento), 'yyyy-MM-dd') : '';
    setAlunoParaEditar({ ...aluno, data_nascimento: dataFormatada });
    setEditModalOpen(true);
  };
  const handleCloseEditModal = () => setEditModalOpen(false);

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setAlunoParaEditar({ ...alunoParaEditar, [name]: value });
  };
  
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const dadosParaEnviar = { ...alunoParaEditar, plano_id: parseInt(alunoParaEditar.plano_id, 10) || null };
      await axios.put(`${API_BASE}/alunos/${alunoParaEditar.id}`, dadosParaEnviar, authHeader());
      toast.success('Aluno atualizado com sucesso!');
      onAlunoAtualizado();
      handleCloseEditModal();
    } catch (error) {
      toast.error('Falha ao atualizar aluno.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza?')) {
      try {
        await axios.delete(`${API_BASE}/alunos/${id}`, authHeader());
        toast.success('Aluno excluído com sucesso!');
        onAlunoExcluido();
      } catch (error) {
        toast.error('Falha ao excluir aluno.');
      }
    }
  };

  const getStatusColor = (status) => {
    if (status === 'atrasado') return 'error';
    if (status === 'em_dia') return 'success';
    if (status === 'pendente') return 'warning';
    return 'default';
  };
  
  return (
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>Lista de Alunos</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome Completo</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status Pagamento</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alunos.map(aluno => (
              <TableRow key={aluno.id} sx={{ backgroundColor: aluno.status_pagamento === 'atrasado' ? '#ffebee' : 'inherit' }}>
                <TableCell>{aluno.nome_completo}</TableCell>
                <TableCell>{aluno.email}</TableCell>
                <TableCell><Chip label={aluno.status_pagamento.replace('_', ' ')} color={getStatusColor(aluno.status_pagamento)} size="small" /></TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenPagamentoModal(aluno)} color="success" title="Registrar Pagamento"><PaymentIcon /></IconButton>
                  <IconButton onClick={() => handleOpenHistoricoModal(aluno)} color="default" title="Histórico de Pagamentos"><HistoryIcon /></IconButton>
                  <IconButton onClick={() => handleOpenEditModal(aluno)} color="primary" title="Editar Aluno"><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(aluno.id)} color="error" title="Excluir Aluno"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {alunoParaEditar && (
        <Modal open={editModalOpen} onClose={handleCloseEditModal}>
          <Box sx={styleModal} component="form" onSubmit={handleUpdateSubmit}>
            <Typography variant="h6">Editar Aluno</Typography>
            <TextField label="Nome Completo" name="nome_completo" value={alunoParaEditar.nome_completo} onChange={handleEditFormChange} fullWidth required />
            <TextField label="CPF" name="cpf" value={alunoParaEditar.cpf} onChange={handleEditFormChange} fullWidth required InputProps={{ inputComponent: CpfMask }} />
            <TextField label="Email" type="email" name="email" value={alunoParaEditar.email} onChange={handleEditFormChange} fullWidth required />
            <TextField label="Telefone" name="telefone" value={alunoParaEditar.telefone} onChange={handleEditFormChange} fullWidth InputProps={{ inputComponent: TelefoneMask }} />
            <TextField label="Data de Nascimento" type="date" name="data_nascimento" value={alunoParaEditar.data_nascimento} onChange={handleEditFormChange} fullWidth required InputLabelProps={{ shrink: true }} />
            <FormControl fullWidth required>
              <InputLabel>Plano</InputLabel>
              <Select name="plano_id" value={alunoParaEditar.plano_id || ''} label="Plano" onChange={handleEditFormChange}>
                {planos.map(plano => <MenuItem key={plano.id} value={plano.id}>{plano.nome}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select name="status" value={alunoParaEditar.status} label="Status" onChange={handleEditFormChange}>
                <MenuItem value="ativo">Ativo</MenuItem>
                <MenuItem value="inativo">Inativo</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={handleCloseEditModal}>Cancelar</Button>
              <Button type="submit" variant="contained">Salvar Alterações</Button>
            </Box>
          </Box>
        </Modal>
      )}

      {alunoParaPagamento && (
         <Modal open={pagamentoModalOpen} onClose={handleClosePagamentoModal}>
            <Box sx={styleModal} component="form" onSubmit={handleSubmitPagamento}>
              <Typography variant="h6">Registrar Pagamento para {alunoParaPagamento?.nome_completo}</Typography>
              <TextField label="Valor a Pagar (R$)" type="number" value={valorPago} onChange={(e) => setValorPago(e.target.value)} fullWidth required sx={{ mt: 2 }} />
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button onClick={handleClosePagamentoModal} variant="text">Cancelar</Button>
                <Button type="submit" variant="contained">Confirmar Pagamento</Button>
              </Box>
            </Box>
          </Modal>
      )}

      {alunoParaHistorico && (
        <Modal open={historicoModalOpen} onClose={handleCloseHistoricoModal}>
          <Box sx={styleModal}>
            <Typography variant="h6">Histórico de Pagamentos de {alunoParaHistorico.nome_completo}</Typography>
            <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 300 }}><Table size="small" stickyHeader><TableHead><TableRow><TableCell>Data</TableCell><TableCell align="right">Valor</TableCell><TableCell align="right">Ação</TableCell></TableRow></TableHead>
                <TableBody>
                  {historicoPagamentos.length > 0 ? historicoPagamentos.map(pg => (
                    <TableRow key={pg.id}><TableCell>{pg.data_pagamento}</TableCell><TableCell align="right">R$ {parseFloat(pg.valor).toFixed(2)}</TableCell>
                    <TableCell align="right"><IconButton size="small" onClick={() => handleDeletePagamento(pg.id)} color="error" title="Excluir Pagamento"><DeleteIcon fontSize="small"/></IconButton></TableCell>
                    </TableRow>
                  )) : ( <TableRow><TableCell colSpan={3} align="center">Nenhum pagamento encontrado.</TableCell></TableRow> )}
                </TableBody>
            </Table></TableContainer>
            <Button onClick={handleCloseHistoricoModal} sx={{ mt: 2, alignSelf: 'flex-end' }}>Fechar</Button>
          </Box>
        </Modal>
      )}
    </>
  );
}

export default AlunosList;