// backend/src/routes/pagamentosRoutes.ts
import express from "express";
import { authenticateUser } from "../middleware/auth";
import * as pagamentosController from "../controllers/pagamentosController";

const router = express.Router();

router.post('/alunos/:id/pagamentos', authenticateUser, pagamentosController.registrarPagamento);
router.get('/alunos/:id/pagamentos', authenticateUser, pagamentosController.getPagamentosPorAluno);
router.delete('/pagamentos/:id', authenticateUser, pagamentosController.deletePagamento);

export default router;