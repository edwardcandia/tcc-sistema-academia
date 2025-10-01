// backend/src/routes/notificacoesRoutes.js
const express = require('express');
const router = express.Router();
const notificacoesController = require('../controllers/notificacoesController');
const verifyAlunoToken = require('../middleware/verifyAlunoToken');

// Todas as rotas precisam de autenticação do aluno
router.use(verifyAlunoToken);

// Obter todas as notificações do aluno
router.get('/', notificacoesController.obterNotificacoes);

// Marcar uma notificação como lida
router.patch('/:id/marcar-lida', notificacoesController.marcarComoLida);

// Marcar todas as notificações como lidas
router.patch('/marcar-todas-lidas', notificacoesController.marcarTodasComoLidas);

// Excluir uma notificação
router.delete('/:id', notificacoesController.excluirNotificacao);

module.exports = router;