// backend/src/routes/feedbackRoutes.js
import express from "express";
const router = express.Router();
import feedbackController from "../controllers/feedbackController";
import { authenticateUser, authorizeRoles  } from "../middleware/auth";

// Rotas para administradores e atendentes cadastrarem feedback em nome dos alunos
router.post('/cadastrar', authenticateUser, feedbackController.criarFeedback);
router.get('/por-aluno/:aluno_id', authenticateUser, feedbackController.obterFeedbacksAluno);

// Rotas para administradores (protegidas por token de administrador)
router.get('/admin/listar', authenticateUser, authorizeRoles(['administrador']), feedbackController.listarTodosFeedbacks);
router.post('/admin/responder/:id', authenticateUser, authorizeRoles(['administrador']), feedbackController.responderFeedback);
router.patch('/admin/arquivar/:id', authenticateUser, authorizeRoles(['administrador']), feedbackController.arquivarFeedback);
router.get('/admin/estatisticas', authenticateUser, authorizeRoles(['administrador']), feedbackController.obterEstatisticasFeedback);

export default router;