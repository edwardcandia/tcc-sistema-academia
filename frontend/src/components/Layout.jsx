// frontend/src/components/Layout.jsx
import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Box, Drawer, CssBaseline, AppBar, Toolbar, List, Typography, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ViewListIcon from '@mui/icons-material/ViewList'; // Novo ícone
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, roles: ['administrador', 'atendente'] },
    { text: 'Alunos', path: '/alunos', icon: <PeopleIcon />, roles: ['administrador', 'atendente'] },
    { text: 'Planos', path: '/planos', icon: <ListAltIcon />, roles: ['administrador'] },
    { text: 'Exercícios', path: '/exercicios', icon: <FitnessCenterIcon />, roles: ['administrador'] },
    { text: 'Modelos de Treino', path: '/modelos-treino', icon: <ViewListIcon />, roles: ['administrador'] }, // <-- ADICIONADO
    { text: 'Relatórios', path: '/relatorios', icon: <AssessmentIcon />, roles: ['administrador'] },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            S.G.A: Sistema de Gestão
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems
              .filter(item => item.roles.includes(user?.cargo))
              .map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton component={Link} to={item.path}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
          </List>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Sair" />
            </ListItemButton>
          </ListItem>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;