import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Alert } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function TokenTester() {
    const { authHeader, token } = useAuth();
    const [testResult, setTestResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const testAlunoToken = async () => {
        setLoading(true);
        setError(null);
        setTestResult(null);
        
        try {
            const storedToken = localStorage.getItem('token');
            console.log('Token armazenado:', storedToken ? storedToken.substring(0, 15) + '...' : 'Nenhum');
            
            const headers = { Authorization: `Bearer ${storedToken}` };
            console.log('Cabeçalhos enviados:', headers);
            
            const response = await axios.get(
                'http://localhost:3001/api/auth/test-aluno-token',
                { headers }
            );
            
            console.log('Resposta do teste de token:', response.data);
            setTestResult(response.data);
        } catch (error) {
            console.error('Erro ao testar token:', error);
            setError({
                message: error.response?.data?.error || error.message,
                status: error.response?.status,
                details: error.response?.data
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 2, my: 2 }}>
            <Typography variant="h6" gutterBottom>
                Testar Autenticação de Aluno
            </Typography>
            
            <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                    Este componente testa se o seu token de autenticação é válido para acesso às áreas de aluno.
                </Typography>
            </Box>
            
            <Button 
                variant="contained" 
                onClick={testAlunoToken}
                disabled={loading || !token}
            >
                {loading ? 'Testando...' : 'Testar Token de Aluno'}
            </Button>
            
            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">
                        Erro: {error.message} (Status: {error.status || 'N/A'})
                    </Typography>
                    {error.details && (
                        <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(error.details, null, 2)}
                        </Typography>
                    )}
                </Alert>
            )}
            
            {testResult && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">
                        Sucesso! Token válido para o aluno ID: {testResult.alunoId}
                    </Typography>
                    <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(testResult, null, 2)}
                    </Typography>
                </Alert>
            )}
        </Paper>
    );
}

export default TokenTester;