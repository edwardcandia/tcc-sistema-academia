// backend/src/routes/notificacoesRoutes.js
import express from "express";
const router = express.Router();
const notificacoesController: any = require('../controllers/notificacoesController');
import { authenticateUser, authorizeRoles  } from "../middleware/auth";

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