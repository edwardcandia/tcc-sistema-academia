import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs-extra';
import { Server } from 'http';

import db from './src/config/database';
import { errorMiddleware, ApiError } from './src/utils/errorHandler';
import setupSwagger from './src/utils/swagger';

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

const logsDir = path.join(__dirname, 'logs');
fs.ensureDirSync(logsDir);

const accessLogStream = fs.createWriteStream(
    path.join(logsDir, 'access.log'),
    { flags: 'a' }
);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : [];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        // In development, allow any localhost port
        if (process.env.NODE_ENV !== 'production' && /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
            return callback(null, true);
        }
        // In production, check against allowed origins list
        if (corsOrigins.includes(origin)) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(morgan('combined', { stream: accessLogStream }));
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

const API_PREFIX = '/api';
app.use(API_PREFIX, authRoutes);
app.use(API_PREFIX, planosRoutes);
app.use(API_PREFIX, alunosRoutes);
app.use(API_PREFIX, dashboardRoutes);
app.use(API_PREFIX, pagamentosRoutes);
app.use(API_PREFIX, exerciciosRoutes);
app.use(API_PREFIX, modelosTreinoRoutes);
app.use(`${API_PREFIX}/registro-treino`, registroTreinoRoutes);
app.use(`${API_PREFIX}/notificacoes`, notificacoesRoutes);
app.use(`${API_PREFIX}/notificacoes-automaticas`, notificacoesAutomaticasRoutes);
app.use(`${API_PREFIX}/feedback`, feedbackRoutes);
app.use(`${API_PREFIX}/termo-matricula`, termoMatriculaRoutes);

app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
    });
});

setupSwagger(app);

app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new ApiError(404, `Rota não encontrada: ${req.originalUrl}`));
});

app.use(errorMiddleware);

const server: Server = app.listen(PORT, async () => {
    try {
        await db.query('SELECT 1');
        console.log(`Server running on port ${PORT}`);
        console.log(`Swagger: http://localhost:${PORT}/api-docs`);
        console.log('Database connection verified');
    } catch (err) {
        console.error('CRITICAL: Database connection failed on startup', err);
        process.exit(1);
    }
});

const shutdown = (signal: string) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(() => process.exit(0));
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

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