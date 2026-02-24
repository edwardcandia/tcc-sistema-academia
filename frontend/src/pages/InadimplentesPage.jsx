import React from 'react';
import { Box, Typography, Divider, Alert } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InadimplentesPanel from '../components/InadimplentesPanel';

function InadimplentesPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <WarningAmberIcon color="warning" sx={{ fontSize: 32 }} />
        <Typography variant="h4" fontWeight={700}>Inadimplência</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Alunos ativos com mensalidade vencida, ordenados pelo mais atrasado. Use o botão de pagamento
        para quitar diretamente ou o ícone de WhatsApp para entrar em contato.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        Registrar um pagamento redefine automaticamente o próximo vencimento para <strong>+30 dias</strong> a partir da data atual.
      </Alert>

      <InadimplentesPanel />
    </Box>
  );
}

export default InadimplentesPage;
