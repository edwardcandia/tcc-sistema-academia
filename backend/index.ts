// backend/index.ts
import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs-extra';
import { Server } from 'http';

// Import custom modules
import db from './src/config/database';
import { errorMiddleware, ApiError } from './src/utils/errorHandler';
import setupSwagger from './src/utils/swagger';

// Import route files
import planosRoutes from './src/routes/planosRoutes';
import alunosRoutes from './src/routes/alunosRoutes';
import dashboardRoutes from './src/routes/dashboardRoutes';
import pagamentosRoutes from './src/routes/pagamentosRoutes';
import authRoutes from './src/routes/authRoutes';
import exerciciosRoutes from './src/routes/exerciciosRoutes';
import modelosTreinoRoutes from './src/routes/modelosTreinoRoutes';
import registroTreinoRoutes from './src/routes/registroTreinoRoutes';
import notificacoesRoutes from './src/routes/notificacoesRoutes';
import notificacoesAutomaticasRoutes from './src/routes/notificacoesAutomaticasRoutes';
import feedbackRoutes from './src/routes/feedbackRoutes';
import termoMatriculaRoutes from './src/routes/termoMatriculaRoutes';

// Load environment variables
dotenv.config();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
fs.ensureDirSync(logsDir);

// Log stream for file
const accessLogStream = fs.createWriteStream(
    path.join(logsDir, 'access.log'), 
    { flags: 'a' }
);

// Verify database connection
db.query('SELECT NOW()')
    .then(() => console.log('--- PostgreSQL connection successful! ---'))
    .catch(err => console.error('!!!!!! CRITICAL DATABASE CONNECTION FAILURE !!!!!!', err));

const app = express();
const PORT = process.env.PORT || 3001;

// Security and performance middlewares
app.use(helmet()); // HTTP header security
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*', // CORS restriction
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(compression()); // Response compression
app.use(express.json({ limit: '1mb' })); // Request size limit
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging
app.use(morgan('combined', { stream: accessLogStream })); // Log to file
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev')); // Console logging in development
}

// API Routes
const API_PREFIX = '/api';
app.use(`${API_PREFIX}`, authRoutes);
app.use(`${API_PREFIX}`, planosRoutes);
app.use(`${API_PREFIX}`, alunosRoutes);
app.use(`${API_PREFIX}`, dashboardRoutes);
app.use(`${API_PREFIX}`, pagamentosRoutes);
app.use(`${API_PREFIX}`, exerciciosRoutes);
app.use(`${API_PREFIX}`, modelosTreinoRoutes);
app.use(`${API_PREFIX}/registro-treino`, registroTreinoRoutes);
app.use(`${API_PREFIX}/notificacoes`, notificacoesRoutes);
app.use(`${API_PREFIX}/notificacoes-automaticas`, notificacoesAutomaticasRoutes);
app.use(`${API_PREFIX}/feedback`, feedbackRoutes);
app.use(`${API_PREFIX}/termo-matricula`, termoMatriculaRoutes);

// API Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'UP', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Configure Swagger UI
setupSwagger(app);

// Middleware for handling routes not found
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(404, `Rota não encontrada - ${req.originalUrl}`);
  next(error);
});

// Error handling middleware
app.use(errorMiddleware);

// Start the server
const server: Server = app.listen(PORT, () => {
  console.log(`--- Server running on port ${PORT} ---`);
  console.log(`--- API documentation available at http://localhost:${PORT}/api-docs ---`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down server...');
  server.close(() => {
    console.log('Server closed');
    db.pool.end();
    process.exit(0);
  });
});

export default server;