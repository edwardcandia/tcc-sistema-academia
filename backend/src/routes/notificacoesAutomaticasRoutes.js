// backend/src/routes/notificacoesAutomaticasRoutes.js
const express = require('express');
const router = express.Router();
const notificacoesAutomaticasController = require('../controllers/notificacoesAutomaticasController');
const verifyToken = require('../middleware/verifyToken');
const authorizeRole = require('../middleware/authorizeRole');

// Rotas protegidas - apenas administradores podem acessar
router.use(verifyToken);
router.use(authorizeRole(['administrador']));

// Rota para enviar lembretes de pagamento
router.post('/enviar-lembretes-pagamento', notificacoesAutomaticasController.enviarLembretesPagamento);

// Rota para enviar lembretes de treino
router.post('/enviar-lembretes-treino', notificacoesAutomaticasController.enviarLembretesTreino);

// Rota para testar o envio de e-mail
router.post('/testar-email', notificacoesAutomaticasController.testarEmail);

module.exports = router;