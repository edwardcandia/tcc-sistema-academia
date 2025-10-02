// frontend/src/components/common/ToastProvider.jsx
import React, { createContext, useContext } from 'react';
import { Snackbar, Alert, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Create Toast Context
const ToastContext = createContext(null);

/**
 * Toast Provider Component - Provides toast notification functionality
 */
export const ToastProvider = ({ children }) => {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [severity, setSeverity] = React.useState('info');
  const [autoHideDuration, setAutoHideDuration] = React.useState(5000);

  // Function to close the toast
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  // Show success toast
  const success = (msg, duration = 5000) => {
    setMessage(msg);
    setSeverity('success');
    setAutoHideDuration(duration);
    setOpen(true);
  };

  // Show error toast
  const error = (msg, duration = 8000) => {
    setMessage(msg);
    setSeverity('error');
    setAutoHideDuration(duration);
    setOpen(true);
  };

  // Show info toast
  const info = (msg, duration = 5000) => {
    setMessage(msg);
    setSeverity('info');
    setAutoHideDuration(duration);
    setOpen(true);
  };

  // Show warning toast
  const warning = (msg, duration = 7000) => {
    setMessage(msg);
    setSeverity('warning');
    setAutoHideDuration(duration);
    setOpen(true);
  };

  // Get severity color based on theme
  const getSeverityColor = () => {
    switch (severity) {
      case 'success': return theme.palette.success.main;
      case 'error': return theme.palette.error.main;
      case 'warning': return theme.palette.warning.main;
      case 'info': return theme.palette.info.main;
      default: return theme.palette.info.main;
    }
  };

  // Expose toast functions via context
  const toastValue = {
    success,
    error,
    info,
    warning,
    close: handleClose,
  };

  // Add to window object for global access (useful for non-React code)
  if (typeof window !== 'undefined') {
    window.toast = toastValue;
  }

  return (
    <ToastContext.Provider value={toastValue}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleClose} 
          severity={severity} 
          variant="filled"
          sx={{ 
            width: '100%', 
            minWidth: '250px',
            boxShadow: `0 2px 10px rgba(0,0,0,0.2)`,
            borderLeft: `5px solid ${getSeverityColor()}`,
          }}
        >
          <Typography variant="body2">{message}</Typography>
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};