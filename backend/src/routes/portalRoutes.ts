import express from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateAluno } from '../middleware/auth';
import * as portalController from '../controllers/portalController';
import * as chatController from '../controllers/chatController';
import { validate, schemas } from '../utils/validator';

const router = express.Router();

// Configuração de Rate Limit para o Chat (3 mensagens por minuto por aluno)
const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 3,
    message: { 
        success: false, 
        error: 'O PlankBot precisa de um descanso entre as séries. Tente novamente em 1 minuto.' 
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * @swagger
 * tags:
 *   name: Portal do Aluno
 *   description: Endpoints exclusivos para acesso do aluno logado
 */

// Rotas do portal protegidas por token de aluno
router.get('/meus-dados', authenticateAluno, portalController.getMeusDados);
router.get('/meus-pagamentos', authenticateAluno, portalController.getMeusPagamentos);
router.get('/meus-treinos', authenticateAluno, portalController.getMeusModelos);
router.get('/meus-treinos/:id', authenticateAluno, portalController.getDetalhesMeuTreino);

// Rota do Chatbot com IA
router.post('/chat', authenticateAluno, chatLimiter, validate(schemas.chat), chatController.handleChat);

export default router;
