// backend/src/routes/notificacoesRoutes.ts
import express from "express";
import * as notificacoesController from "../controllers/notificacoesController";
import { authenticateUser, authorizeRoles } from "../middleware/auth";

const router = express.Router();

// Proteção administrativa para gerenciar notificações

// Obter todas as notificações de um aluno (por admin/atendente)
router.get('/aluno/:aluno_id', authenticateUser, notificacoesController.obterNotificacoes);

// Marcar uma notificação como lida (por admin/atendente)
router.patch('/:id/marcar-lida', authenticateUser, notificacoesController.marcarComoLida);

// Marcar todas as notificações de um aluno como lidas
router.patch('/aluno/:aluno_id/marcar-todas-lidas', authenticateUser, notificacoesController.marcarTodasComoLidas);

// Excluir uma notificação
router.delete('/:id', authenticateUser, authorizeRoles(['administrador', 'atendente']), notificacoesController.excluirNotificacao);

// Criar nova notificação para um aluno
router.post('/criar', authenticateUser, authorizeRoles(['administrador', 'atendente', 'instrutor']), notificacoesController.criarNotificacao);

export default router;