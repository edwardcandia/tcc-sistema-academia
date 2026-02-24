// backend/src/routes/notificacoesRoutes.ts
import express from "express";
import * as notificacoesController from "../controllers/notificacoesController";
import { authenticateUser, authenticateAluno, authorizeRoles } from "../middleware/auth";

const router = express.Router();

// ── Rotas do portal do aluno (token tipo 'aluno') ──
router.get('/me', authenticateAluno, notificacoesController.obterMinhasNotificacoes);
router.patch('/me/:id/lida', authenticateAluno, notificacoesController.marcarComoLidaMe);
router.patch('/me/todas-lidas', authenticateAluno, notificacoesController.marcarTodasComoLidasMe);

// ── Rotas administrativas (token de funcionário) ──
router.get('/aluno/:aluno_id', authenticateUser, notificacoesController.obterNotificacoes);
router.patch('/:id/marcar-lida', authenticateUser, notificacoesController.marcarComoLida);
router.patch('/aluno/:aluno_id/marcar-todas-lidas', authenticateUser, notificacoesController.marcarTodasComoLidas);
router.delete('/:id', authenticateUser, authorizeRoles(['administrador', 'atendente']), notificacoesController.excluirNotificacao);
router.post('/criar', authenticateUser, authorizeRoles(['administrador', 'atendente']), notificacoesController.criarNotificacao);

export default router;
