// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Importar módulos personalizados
const db = require('./src/config/database');
const { errorMiddleware } = require('./src/utils/errorHandler');
const setupSwagger = require('./src/utils/swagger');

// Criar diretório de logs se não existir
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Stream de log para arquivo
const accessLogStream = fs.createWriteStream(
    path.join(logsDir, 'access.log'), 
    { flags: 'a' }
);

// Verificar conexão com o banco de dados
db.query('SELECT NOW()')
    .then(res => console.log('--- Conexão com o PostgreSQL bem-sucedida! ---'))
    .catch(err => console.error('!!!!!! FALHA CRÍTICA NA CONEXÃO COM O BANCO DE DADOS !!!!!!', err));

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de segurança e performance
app.use(helmet()); // Segurança de cabeçalhos HTTP
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*', // Restrição de CORS
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(compression()); // Compressão de resposta
app.use(express.json({ limit: '1mb' })); // Limite de tamanho de requisição
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging
app.use(morgan('combined', { stream: accessLogStream })); // Log para arquivo
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev')); // Log para console em desenvolvimento
}

const planosRoutes = require('./src/routes/planosRoutes');
const alunosRoutes = require('./src/routes/alunosRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const pagamentosRoutes = require('./src/routes/pagamentosRoutes');
const authRoutes = require('./src/routes/authRoutes');
const relatoriosRoutes = require('./src/routes/relatoriosRoutes');
// Portal routes removido (acesso de alunos)
const exerciciosRoutes = require('./src/routes/exerciciosRoutes');
const modelosTreinoRoutes = require('./src/routes/modelosTreinoRoutes');
const registroTreinoRoutes = require('./src/routes/registroTreinoRoutes');
const notificacoesRoutes = require('./src/routes/notificacoesRoutes');
const notificacoesAutomaticasRoutes = require('./src/routes/notificacoesAutomaticasRoutes');
const feedbackRoutes = require('./src/routes/feedbackRoutes');

// Rotas da API
const API_PREFIX = '/api';
app.use(`${API_PREFIX}`, authRoutes);
app.use(`${API_PREFIX}`, planosRoutes);
app.use(`${API_PREFIX}`, alunosRoutes);
app.use(`${API_PREFIX}`, dashboardRoutes);
app.use(`${API_PREFIX}`, pagamentosRoutes);
app.use(`${API_PREFIX}`, relatoriosRoutes);
// Portal routes removido (acesso de alunos)
app.use(`${API_PREFIX}`, exerciciosRoutes);
app.use(`${API_PREFIX}`, modelosTreinoRoutes);
app.use(`${API_PREFIX}/registro-treino`, registroTreinoRoutes);
app.use(`${API_PREFIX}/notificacoes`, notificacoesRoutes);
app.use(`${API_PREFIX}/notificacoes-automaticas`, notificacoesAutomaticasRoutes);
app.use(`${API_PREFIX}/feedback`, feedbackRoutes);
// Rotas de aulas removidas conforme solicitado

// Rota de verificação de saúde da API
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'UP', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Configurar Swagger UI
setupSwagger(app);

// Middleware para lidar com rotas não encontradas
app.use((req, res, next) => {
  const error = new Error(`Rota não encontrada - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Middleware de tratamento de erros
app.use(errorMiddleware);

// Iniciar o servidor
const server = app.listen(PORT, () => {
  console.log(`--- Servidor rodando na porta ${PORT} ---`);
  console.log(`--- Documentação da API disponível em http://localhost:${PORT}/api-docs ---`);
});

// Tratamento de encerramento elegante
process.on('SIGTERM', () => {
  console.log('Recebido SIGTERM, encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    db.pool.end();
    process.exit(0);
  });
});