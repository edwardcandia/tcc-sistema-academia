// backend/src/routes/feedbackRoutes.ts
import express from "express";
import * as feedbackController from "../controllers/feedbackController";
import { authenticateUser, authorizeRoles, authenticateAluno } from "../middleware/auth";

const router = express.Router();

// Rotas para o portal do aluno
router.get('/aluno/meus', authenticateAluno, feedbackController.obterMeusFeedbacks);
router.post('/aluno/novo', authenticateAluno, feedbackController.criarFeedbackAluno);

// Rotas para administradores e atendentes cadastrarem feedback em nome dos alunos
router.post('/cadastrar', authenticateUser, feedbackController.criarFeedback);
router.get('/por-aluno/:aluno_id', authenticateUser, feedbackController.obterFeedbacksAluno);

// Rotas para administradores (protegidas por token de administrador)
router.get('/admin/listar', authenticateUser, authorizeRoles(['administrador']), feedbackController.listarTodosFeedbacks);
router.post('/admin/responder/:id', authenticateUser, authorizeRoles(['administrador']), feedbackController.responderFeedback);
router.patch('/admin/arquivar/:id', authenticateUser, authorizeRoles(['administrador']), feedbackController.arquivarFeedback);
router.get('/admin/estatisticas', authenticateUser, authorizeRoles(['administrador']), feedbackController.obterEstatisticasFeedback);

export default router;