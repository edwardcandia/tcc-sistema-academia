//backend/debug_server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./src/config/database');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rota básica para testar conexão
app.get('/', (req, res) => {
    res.json({ message: 'API Academia - Depuração' });
});

// Rotas principais
app.post('/api/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        console.log('Login attempt:', email);
        
        // Buscar aluno pelo email
        const result = await db.query('SELECT id, email, senha FROM alunos WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }
        
        const aluno = result.rows[0];
        
        // Verificar senha (em produção usar bcrypt)
        if (senha !== '123456') {
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }
        
        // Token simulado para teste
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwidGlwbyI6ImFsdW5vIiwiaWF0IjoxNjE1MjQ5MDIyLCJleHAiOjE2MTUzMzU0MjJ9.oBZ8O9u1x5M7NxeU5-rY4J3bPzDGiL8Er4O1jTR-6X4';
        
        res.json({ token });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

// Rota de teste para modelos de treino
app.get('/api/alunos/:alunoId/modelos-treino', async (req, res) => {
    try {
        const { alunoId } = req.params;
        console.log('Request para buscar modelos de treino, params:', { alunoId });
        
        // Verificar o token do cabeçalho
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Token não fornecido' });
        }
        
        // Para teste, vamos só verificar se o aluno existe
        const alunoResult = await db.query('SELECT id FROM alunos WHERE id = $1', [alunoId]);
        if (alunoResult.rows.length === 0) {
            return res.status(404).json({ error: 'Aluno não encontrado.' });
        }
        
        // Buscar modelos de treino
        try {
            const query = `
                SELECT mt.id, mt.nome, mt.descricao 
                FROM modelos_treino mt
                JOIN alunos_modelos_treino amt ON mt.id = amt.modelo_treino_id
                WHERE amt.aluno_id = $1
                ORDER BY mt.nome ASC
            `;
            const result = await db.query(query, [alunoId]);
            console.log('Modelos encontrados:', result.rows.length);
            
            res.json({
                success: true,
                data: result.rows
            });
        } catch (queryError) {
            console.error('Erro na consulta SQL:', queryError);
            res.status(500).json({ error: 'Erro ao buscar modelos de treino.' });
        }
    } catch (error) {
        console.error('Erro ao processar requisição:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

// Rota de teste para histórico de treinos
app.get('/api/registro-treino/historico', async (req, res) => {
    try {
        // Extrair ID do aluno do token (simulado)
        const aluno_id = 8;
        console.log('Buscando histórico para aluno:', aluno_id);
        
        // Obter histórico
        try {
            const registros = await db.query(
                `SELECT 
                    r.id, 
                    r.treino_id, 
                    mt.nome AS treino_nome, 
                    r.data_realizacao, 
                    r.duracao, 
                    r.observacoes, 
                    r.avaliacao
                FROM 
                    registros_treino r
                JOIN 
                    modelos_treino mt ON r.treino_id = mt.id
                WHERE 
                    r.aluno_id = $1
                ORDER BY 
                    r.data_realizacao DESC
                LIMIT 10`,
                [aluno_id]
            );
            
            console.log('Registros encontrados:', registros.rows.length);
            res.json({
                success: true,
                data: registros.rows
            });
        } catch (queryError) {
            console.error('Erro na consulta SQL:', queryError);
            res.status(500).json({ 
                success: false,
                message: 'Erro ao buscar histórico de treinos',
                error: queryError.message
            });
        }
    } catch (error) {
        console.error('Erro ao processar requisição:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// Inicializar servidor
const startServer = async () => {
    try {
        // Testar conexão com o banco
        await db.query('SELECT NOW()');
        console.log('--- Conexão com o PostgreSQL bem-sucedida! ---');
        
        app.listen(PORT, () => {
            console.log(`--- Servidor de debug rodando na porta ${PORT} ---`);
            console.log(`--- Acesse http://localhost:${PORT}/ para verificar ---`);
        });
    } catch (error) {
        console.error('Erro ao conectar ao PostgreSQL:', error);
        console.error('Detalhes do erro:', error.stack);
        process.exit(1);
    }
};

// Capturar erros não tratados
process.on('uncaughtException', (error) => {
    console.error('ERRO NÃO TRATADO:', error);
    console.error('Stack trace:', error.stack);
});

startServer().catch(err => {
    console.error('Erro fatal ao iniciar servidor:', err);
});