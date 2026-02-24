import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, CssBaseline, AppBar, Toolbar, List, Typography,
  ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton,
  useMediaQuery, Divider, Tooltip, Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ViewListIcon from '@mui/icons-material/ViewList';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { useAuth } from '../context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DRAWER_WIDTH = 240;

const menuItems = [
  { text: 'Dashboard',         path: '/dashboard',               icon: <DashboardIcon />,           roles: ['administrador', 'atendente'] },
  { text: 'Alunos',            path: '/alunos',                  icon: <PeopleIcon />,              roles: ['administrador', 'atendente'] },
  { text: 'Inadimplência',     path: '/inadimplentes',           icon: <WarningAmberIcon />,        roles: ['administrador', 'atendente'] },
  { text: 'Planos',            path: '/planos',                  icon: <ListAltIcon />,             roles: ['administrador'] },
  { text: 'Exercícios',        path: '/exercicios',              icon: <FitnessCenterIcon />,       roles: ['administrador'] },
  { text: 'Modelos de Treino', path: '/modelos-treino',          icon: <ViewListIcon />,            roles: ['administrador'] },
  { text: 'Notificações',      path: '/notificacoes-automaticas',icon: <NotificationsActiveIcon />, roles: ['administrador'] },
  { text: 'Usuários',          path: '/usuarios',                icon: <ManageAccountsIcon />,       roles: ['administrador'] },
];

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar />
      <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
        <List>
          {menuItems
            .filter(item => item.roles.includes(user?.cargo))
            .map((item) => {
              const active = location.pathname.startsWith(item.path);
              return (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    selected={active}
                    onClick={() => isMobile && setMobileOpen(false)}
                    sx={{
                      borderRadius: '8px',
                      mx: 1,
                      mb: 0.25,
                      '&.Mui-selected': {
                        bgcolor: theme.palette.primary.main + '1A',
                        '& .MuiListItemIcon-root': { color: theme.palette.primary.main },
                        '& .MuiListItemText-primary': { fontWeight: 600, color: theme.palette.primary.main },
                      },
                      '&:hover': { bgcolor: theme.palette.action.hover },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              );
            })}
        </List>
      </Box>
      <Divider />
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="caption" color="text.secondary" display="block" noWrap>
          {user?.nome || user?.email}
        </Typography>
        <Chip
          label={user?.cargo === 'administrador' ? 'Administrador' : 'Atendente'}
          size="small"
          color={user?.cargo === 'administrador' ? 'primary' : 'default'}
          sx={{ mt: 0.5, fontSize: '0.7rem', height: 20 }}
        />
      </Box>
      <Divider />
      <List sx={{ pb: 1 }}>
        <ListItem disablePadding>
          <Tooltip title={`Sair — ${user?.nome || user?.email || ''}`} placement="right">
            <ListItemButton
              onClick={handleLogout}
              sx={{ borderRadius: '8px', mx: 1, mt: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}><LogoutIcon color="error" /></ListItemIcon>
              <ListItemText
                primary="Sair"
                primaryTypographyProps={{ color: 'error', fontWeight: 500 }}
              />
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <ToastContainer position="top-right" autoClose={3500} hideProgressBar={false} newestOnTop />

      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(prev => !prev)}
              sx={{ mr: 2 }}
              aria-label="abrir menu"
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <img
              src="/assets/logos/plankgym/logo-main.png"
              alt="PlankGYM"
              style={{ height: 36 }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <Typography variant="h6" noWrap fontWeight="bold">
              PlankGYM
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer temporário para mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Drawer fixo para desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;
