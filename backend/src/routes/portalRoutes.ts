import express from 'express';
import { authenticateAluno } from '../middleware/auth';
import * as portalController from '../controllers/portalController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Portal do Aluno
 *   description: Endpoints exclusivos para acesso do aluno logado
 */

// Rotas do portal protegidas por token de aluno
router.get('/meus-dados', authenticateAluno, portalController.getMeusDados);
router.get('/meus-pagamentos', authenticateAluno, portalController.getMeusPagamentos);

export default router;
