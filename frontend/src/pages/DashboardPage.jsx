// frontend/src/pages/DashboardPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  CssBaseline, Container, Typography, Box, TextField, FormControl, InputLabel, Select, MenuItem, Button, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Dashboard from '../components/Dashboard';
import PlanosList from '../components/PlanosList';
import PlanosForm from '../components/PlanosForm';
import AlunosList from '../components/AlunosList';
import AlunosForm from '../components/AlunosForm';

function DashboardPage() {
    const { authHeader, user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [planos, setPlanos] = useState([]);
    const [alunos, setAlunos] = useState([]);
    const [modelosTreino, setModelosTreino] = useState([]); // Manter, mesmo que vazio, para evitar erros
    const [termoBusca, setTermoBusca] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('todos');

    const fetchPageData = async () => {
        if (!authHeader) return;
        try {
            const [resAlunos, resPlanos] = await Promise.all([
                axios.get('http://localhost:3001/api/alunos', authHeader()),
                axios.get('http://localhost:3001/api/planos', authHeader()),
            ]);
            setAlunos(resAlunos.data);
            setPlanos(resPlanos.data);
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        }
    };

    useEffect(() => {
        fetchPageData();
    }, [authHeader]);

    const alunosFiltrados = useMemo(() => {
        return alunos.filter(aluno => {
            const busca = termoBusca.toLowerCase();
            const status = filtroStatus;
            if (!aluno.nome_completo || !aluno.email) return false;
            const matchBusca = aluno.nome_completo.toLowerCase().includes(busca) || aluno.email.toLowerCase().includes(busca);
            const matchStatus = status === 'todos' || aluno.status === status;
            return matchBusca && matchStatus;
        });
    }, [alunos, termoBusca, filtroStatus]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <CssBaseline />
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            <Container maxWidth="lg">
                <Box sx={{ my: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h4" component="h1">S.G.A: Sistema de Gestão</Typography>
                        <Button variant="outlined" onClick={handleLogout}>Sair</Button>
                    </Box>

                    <Dashboard />

                    {user?.cargo === 'administrador' && (
                        <Box sx={{ my: 4 }}>
                            <Accordion defaultExpanded>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="h5">Gerenciar Planos</Typography></AccordionSummary>
                                <AccordionDetails>
                                    <PlanosForm onPlanoAdicionado={fetchPageData} />
                                    <PlanosList planos={planos} onPlanoExcluido={fetchPageData} onPlanoAtualizado={fetchPageData} />
                                </AccordionDetails>
                            </Accordion>
                        </Box>
                    )}

                    <Box sx={{ my: 4 }}>
                        <Accordion defaultExpanded>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="h5">Gerenciar Alunos</Typography></AccordionSummary>
                            <AccordionDetails>
                                <AlunosForm planos={planos} onAlunoAdicionado={fetchPageData} />
                                <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
                                    <TextField label="Buscar por Nome ou Email" variant="outlined" size="small" fullWidth value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} />
                                    <FormControl size="small" sx={{ minWidth: 120 }}><InputLabel>Status</InputLabel><Select value={filtroStatus} label="Status" onChange={(e) => setFiltroStatus(e.target.value)}><MenuItem value="todos">Todos</MenuItem><MenuItem value="ativo">Ativo</MenuItem><MenuItem value="inativo">Inativo</MenuItem></Select></FormControl>
                                </Box>
                                <AlunosList alunos={alunosFiltrados} planos={planos} modelosTreino={modelosTreino} onAlunoExcluido={fetchPageData} onAlunoAtualizado={fetchPageData} />
                            </AccordionDetails>
                        </Accordion>
                    </Box>
                </Box>
            </Container>
        </>
    );
}

export default DashboardPage;