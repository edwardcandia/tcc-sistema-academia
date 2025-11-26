// backend/src/routes/notificacoesAutomaticasRoutes.js
import express from "express";
const router = express.Router();
const notificacoesAutomaticasController: any = require('../controllers/notificacoesAutomaticasController');
import verifyToken from "../middleware/verifyToken";
import authorizeRole from "../middleware/authorizeRole";

// Rotas protegidas - apenas administradores podem acessar
router.use(verifyToken);
router.use(authorizeRole(['administrador']));

// Rota para enviar lembretes de pagamento
router.post('/enviar-lembretes-pagamento', notificacoesAutomaticasController.enviarLembretesPagamento);

// Rota para enviar lembretes de treino
router.post('/enviar-lembretes-treino', notificacoesAutomaticasController.enviarLembretesTreino);

// Rota para testar o envio de e-mail
router.post('/testar-email', notificacoesAutomaticasController.testarEmail);

export default router;