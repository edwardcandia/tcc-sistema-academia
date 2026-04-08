import React, { useState, useRef, useEffect } from 'react';
import { 
  Fab, Popover, Box, TextField, IconButton, Typography, 
  CircularProgress, Paper, Divider, Tooltip, Avatar
} from '@mui/material';
import { 
  Chat as ChatIcon, 
  Send as SendIcon, 
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../services/api';
import ChatMessage from './ChatMessage';

const ChatbotWidget = () => {
  const { authHeader } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [fullScreen, setFullScreen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Olá! Sou o PlankBot. Como posso te ajudar hoje com seus treinos ou dúvidas?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (anchorEl) {
      scrollToBottom();
    }
  }, [messages, anchorEl]);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setFullScreen(false);
  };

  const toggleFullScreen = () => {
    setFullScreen(!fullScreen);
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/portal/chat`, { messages: newMessages }, authHeader());
      
      if (response.data.success) {
        setMessages([...newMessages, response.data.data.message]);
      } else {
        throw new Error(response.data.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro no PlankBot:', error);
      const errorMessage = error.response?.data?.error || 'O PlankBot está descansando entre as séries. Tente novamente em instantes!';
      setMessages([...newMessages, { role: 'assistant', content: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  const popoverStyles = fullScreen ? {
    '& .MuiPaper-root': {
      width: '95vw',
      height: '90vh',
      borderRadius: 4,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: 24,
      position: 'fixed',
      top: '5vh !important',
      left: '2.5vw !important',
      transform: 'none !important',
    }
  } : {
    '& .MuiPaper-root': {
      width: { xs: '90vw', sm: 350 },
      height: 500,
      borderRadius: 3,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: 10,
    }
  };

  return (
    <>
      <Tooltip title="PlankBot - Assistente de IA">
        <Fab 
          color="primary" 
          aria-label="chat" 
          onClick={handleOpen}
          sx={{ 
            position: 'fixed', 
            bottom: 24, 
            right: 24,
            boxShadow: 4,
            zIndex: 1000
          }}
        >
          <ChatIcon />
        </Fab>
      </Tooltip>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={fullScreen ? { vertical: 'center', horizontal: 'center' } : {
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={fullScreen ? { vertical: 'center', horizontal: 'center' } : {
          vertical: 'bottom',
          horizontal: 'right',
        }}
        sx={popoverStyles}
      >
        {/* Header */}
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar 
                src="/assets/logos/plankgym/logo-favicon.png" 
                sx={{ width: 32, height: 32, bgcolor: 'white', p: 0.5 }}
            />
            <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>PlankBot</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>Assistente Virtual</Typography>
            </Box>
          </Box>
          <Box>
            <IconButton size="small" onClick={toggleFullScreen} sx={{ color: 'white', mr: 0.5 }}>
                {fullScreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
            </IconButton>
            <IconButton size="small" onClick={handleClose} sx={{ color: 'white' }}>
                <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Chat Messages Area */}
        <Box sx={{ flex: 1, p: 2, overflowY: 'auto', bgcolor: '#fafafa' }}>
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          {loading && (
            <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
              <CircularProgress size={16} color="primary" />
              <Typography variant="caption" color="text.secondary">PlankBot está digitando...</Typography>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Divider />

        {/* Input Area */}
        <Box sx={{ p: 1.5, bgcolor: 'white' }}>
            <Box 
                component="form" 
                onSubmit={handleSend}
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}
            >
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Pergunte sobre seu treino..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 4,
                            bgcolor: '#f5f5f5'
                        }
                    }}
                />
                <IconButton 
                    color="primary" 
                    type="submit" 
                    disabled={!input.trim() || loading}
                    sx={{ 
                        bgcolor: 'primary.main', 
                        '&:hover': { bgcolor: 'primary.dark' }, 
                        color: 'white',
                        '&.Mui-disabled': { bgcolor: '#ccc', color: 'white' }
                    }}
                >
                    <SendIcon fontSize="small" />
                </IconButton>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'center', fontSize: '0.65rem' }}>
                O PlankBot pode cometer erros. Considere verificar informações importantes.
            </Typography>
        </Box>
      </Popover>
    </>
  );
};

export default ChatbotWidget;
