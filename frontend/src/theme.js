// frontend/src/theme.js
import { createTheme } from '@mui/material/styles';

// Create a theme instance
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2E7D32', // Verde escuro - cor principal da academia
      light: '#4CAF50',
      dark: '#1B5E20',
      contrastText: '#fff',
    },
    secondary: {
      main: '#FF5722', // Laranja - cor de destaque
      light: '#FF8A65',
      dark: '#D84315',
      contrastText: '#fff',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    error: {
      main: '#D32F2F',
    },
    warning: {
      main: '#FFC107',
    },
    info: {
      main: '#2196F3',
    },
    success: {
      main: '#4CAF50',
    },
    grey: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: '0.875rem',
      lineHeight: 1.57,
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.66,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.08),0px 1px 1px 0px rgba(0,0,0,0.07),0px 1px 3px 0px rgba(0,0,0,0.05)',
    '0px 3px 3px -2px rgba(0,0,0,0.08),0px 2px 4px 0px rgba(0,0,0,0.07),0px 1px 8px 0px rgba(0,0,0,0.05)',
    '0px 3px 4px -2px rgba(0,0,0,0.08),0px 3px 5px 0px rgba(0,0,0,0.07),0px 1px 10px 0px rgba(0,0,0,0.05)',
    '0px 2px 5px -1px rgba(0,0,0,0.08),0px 4px 6px 0px rgba(0,0,0,0.07),0px 1px 10px 0px rgba(0,0,0,0.05)',
    '0px 3px 6px -1px rgba(0,0,0,0.08),0px 5px 8px 0px rgba(0,0,0,0.07),0px 1px 14px 0px rgba(0,0,0,0.05)',
    '0px 3px 8px -1px rgba(0,0,0,0.08),0px 6px 10px 0px rgba(0,0,0,0.07),0px 1px 18px 0px rgba(0,0,0,0.05)',
    '0px 4px 9px -2px rgba(0,0,0,0.08),0px 7px 12px 1px rgba(0,0,0,0.07),0px 2px 16px 1px rgba(0,0,0,0.05)',
    '0px 5px 10px -3px rgba(0,0,0,0.08),0px 8px 16px 1px rgba(0,0,0,0.07),0px 3px 14px 2px rgba(0,0,0,0.05)',
    '0px 5px 12px -3px rgba(0,0,0,0.08),0px 9px 18px 1px rgba(0,0,0,0.07),0px 3px 16px 2px rgba(0,0,0,0.05)',
    '0px 6px 13px -4px rgba(0,0,0,0.08),0px 10px 20px 1px rgba(0,0,0,0.07),0px 4px 18px 3px rgba(0,0,0,0.05)',
    '0px 6px 14px -4px rgba(0,0,0,0.08),0px 11px 22px 1px rgba(0,0,0,0.07),0px 4px 20px 3px rgba(0,0,0,0.05)',
    '0px 7px 16px -4px rgba(0,0,0,0.08),0px 12px 24px 2px rgba(0,0,0,0.07),0px 5px 22px 4px rgba(0,0,0,0.05)',
    '0px 7px 17px -4px rgba(0,0,0,0.08),0px 13px 26px 2px rgba(0,0,0,0.07),0px 5px 24px 4px rgba(0,0,0,0.05)',
    '0px 7px 18px -4px rgba(0,0,0,0.08),0px 14px 28px 2px rgba(0,0,0,0.07),0px 5px 26px 4px rgba(0,0,0,0.05)',
    '0px 8px 19px -5px rgba(0,0,0,0.08),0px 15px 30px 2px rgba(0,0,0,0.07),0px 6px 28px 5px rgba(0,0,0,0.05)',
    '0px 8px 20px -5px rgba(0,0,0,0.08),0px 16px 32px 2px rgba(0,0,0,0.07),0px 6px 30px 5px rgba(0,0,0,0.05)',
    '0px 8px 22px -5px rgba(0,0,0,0.08),0px 17px 34px 2px rgba(0,0,0,0.07),0px 7px 32px 5px rgba(0,0,0,0.05)',
    '0px 9px 23px -5px rgba(0,0,0,0.08),0px 18px 36px 2px rgba(0,0,0,0.07),0px 7px 34px 6px rgba(0,0,0,0.05)',
    '0px 9px 24px -6px rgba(0,0,0,0.08),0px 19px 38px 3px rgba(0,0,0,0.07),0px 8px 36px 6px rgba(0,0,0,0.05)',
    '0px 10px 25px -6px rgba(0,0,0,0.08),0px 20px 40px 3px rgba(0,0,0,0.07),0px 8px 38px 7px rgba(0,0,0,0.05)',
    '0px 10px 26px -6px rgba(0,0,0,0.08),0px 21px 42px 3px rgba(0,0,0,0.07),0px 8px 40px 7px rgba(0,0,0,0.05)',
    '0px 10px 27px -6px rgba(0,0,0,0.08),0px 22px 44px 3px rgba(0,0,0,0.07),0px 9px 42px 7px rgba(0,0,0,0.05)',
    '0px 11px 28px -7px rgba(0,0,0,0.08),0px 23px 46px 4px rgba(0,0,0,0.07),0px 9px 44px 8px rgba(0,0,0,0.05)',
    '0px 11px 30px -7px rgba(0,0,0,0.08),0px 24px 48px 4px rgba(0,0,0,0.07),0px 9px 46px 8px rgba(0,0,0,0.05)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        containedPrimary: {
          boxShadow: '0px 4px 10px rgba(46, 125, 50, 0.25)',
          '&:hover': {
            boxShadow: '0px 6px 15px rgba(46, 125, 50, 0.35)',
          },
        },
        containedSecondary: {
          boxShadow: '0px 4px 10px rgba(255, 87, 34, 0.25)',
          '&:hover': {
            boxShadow: '0px 6px 15px rgba(255, 87, 34, 0.35)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;