// backend/src/routes/notificacoesAutomaticasRoutes.ts
import express from "express";
import { authenticateUser, authorizeRoles } from "../middleware/auth";
import * as notificacoesAutomaticasController from "../controllers/notificacoesAutomaticasController";

const router = express.Router();

// Rotas protegidas - apenas administradores podem acessar
router.use(authenticateUser);
router.use(authorizeRoles(['administrador']));

router.post('/enviar-lembretes-pagamento', notificacoesAutomaticasController.enviarLembretesPagamento);
router.post('/enviar-lembretes-treino', notificacoesAutomaticasController.enviarLembretesTreino);
router.post('/testar-email', notificacoesAutomaticasController.testarEmail);

export default router;