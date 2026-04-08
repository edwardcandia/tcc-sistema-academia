import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { SmartToy, Person } from '@mui/icons-material';

const ChatMessage = ({ message }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isAssistant ? 'row' : 'row-reverse',
        alignItems: 'flex-start',
        gap: 1,
        mb: 2,
      }}
    >
      <Avatar
        src={isAssistant ? "/assets/logos/plankgym/logo-favicon.png" : undefined}
        sx={{
          bgcolor: isAssistant ? 'white' : 'secondary.main',
          width: 32,
          height: 32,
          p: isAssistant ? 0.5 : 0,
          border: isAssistant ? '1px solid #eee' : 'none'
        }}
      >
        {!isAssistant && <Person fontSize="small" />}
      </Avatar>
      <Box
        sx={{
          maxWidth: '80%',
          bgcolor: isAssistant ? 'grey.100' : 'primary.main',
          color: isAssistant ? 'text.primary' : 'primary.contrastText',
          p: 1.5,
          borderRadius: 2,
          borderTopLeftRadius: isAssistant ? 0 : 2,
          borderTopRightRadius: isAssistant ? 2 : 0,
          boxShadow: 1,
        }}
      >
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {message.content}
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatMessage;
