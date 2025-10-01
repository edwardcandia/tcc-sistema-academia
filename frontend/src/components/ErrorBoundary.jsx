// frontend/src/components/ErrorBoundary.jsx
import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Warning } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Atualiza o estado para que a próxima renderização mostre a UI alternativa
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Você pode registrar o erro em um serviço de relatórios de erros
    console.error("Erro capturado pelo ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    // Tenta recuperar recarregando a página
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            flexDirection: 'column',
            p: 3
          }}
        >
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              maxWidth: '600px',
              borderTop: '4px solid #f44336'
            }}
          >
            <Warning color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom>Algo deu errado!</Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              Ocorreu um erro ao carregar esta página. Isto pode ser um problema temporário.
            </Typography>
            <Typography variant="body2" color="error" sx={{ mb: 2, fontFamily: 'monospace', textAlign: 'left', whiteSpace: 'pre-wrap' }}>
              {this.state.error && this.state.error.toString()}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={this.handleReset}
              >
                Tentar Novamente
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;