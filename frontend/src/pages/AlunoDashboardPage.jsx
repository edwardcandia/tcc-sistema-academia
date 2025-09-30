// frontend/src/pages/AlunoDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Container, Typography, Box, Paper, List, ListItem, ListItemText, Divider, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function AlunoDashboardPage() {
    const { authHeader, aluno, logout } = useAuth();
    const navigate = useNavigate();
    const [meusDados, setMeusDados] = useState(null);
    const [meusPagamentos, setMeusPagamentos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!authHeader) return;
            try {
                setLoading(true);
                const [resDados, resPagamentos] = await Promise.all([
                    axios.get('http://localhost:3001/api/portal/meus-dados', authHeader()),
                    axios.get('http://localhost:3001/api/portal/meus-pagamentos', authHeader())
                ]);
                setMeusDados(resDados.data);
                setMeusPagamentos(resPagamentos.data);
            } catch (error) {
                console.error("Erro ao buscar dados do portal do aluno:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [authHeader]);

    const handleLogout = () => {
        logout();
        navigate('/login'); // <-- CORREÇÃO APLICADA AQUI
    };

    if (loading) {
        return (
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Meu Painel
                    </Typography>
                    <Button variant="outlined" onClick={handleLogout}>Sair</Button>
                </Box>
                <Typography variant="h6">Olá, {meusDados?.nome_completo || aluno?.nome}!</Typography>
                
                <Paper sx={{ p: 2, mt: 4 }}>
                    <Typography variant="h6" gutterBottom>Minhas Informações</Typography>
                    <List>
                        <ListItem><ListItemText primary="Email" secondary={meusDados?.email} /></ListItem>
                        <ListItem><ListItemText primary="CPF" secondary={meusDados?.cpf} /></ListItem>
                        <ListItem><ListItemText primary="Telefone" secondary={meusDados?.telefone} /></ListItem>
                        <ListItem><ListItemText primary="Data de Nascimento" secondary={meusDados?.data_nascimento} /></ListItem>
                    </List>
                </Paper>

                <Paper sx={{ p: 2, mt: 4 }}>
                    <Typography variant="h6" gutterBottom>Meu Plano</Typography>
                     <List>
                        <ListItem><ListItemText primary="Plano Atual" secondary={meusDados?.nome_plano || 'Nenhum plano ativo'} /></ListItem>
                        <ListItem><ListItemText primary="Próximo Vencimento" secondary={meusDados?.proximo_vencimento || 'Aguardando primeiro pagamento'} /></ListItem>
                    </List>
                </Paper>

                <Paper sx={{ p: 2, mt: 4 }}>
                    <Typography variant="h6" gutterBottom>Meu Histórico de Pagamentos</Typography>
                    <List sx={{ maxHeight: 200, overflow: 'auto' }}>
                        {meusPagamentos.length > 0 ? meusPagamentos.map(pg => (
                            <ListItem key={pg.id}>
                                <ListItemText primary={`Pagamento de R$ ${parseFloat(pg.valor).toFixed(2)}`} secondary={`Realizado em ${pg.data_pagamento}`} />
                            </ListItem>
                        )) : <ListItem><ListItemText primary="Nenhum pagamento registrado." /></ListItem>}
                    </List>
                </Paper>
            </Box>
        </Container>
    );
}

export default AlunoDashboardPage;