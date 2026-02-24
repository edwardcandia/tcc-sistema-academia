// backend/src/routes/pagamentosRoutes.ts
import express from "express";
import { authenticateUser, authorizeRoles } from "../middleware/auth";
import * as pagamentosController from "../controllers/pagamentosController";

const router = express.Router();

// Administradores e atendentes podem registrar e consultar pagamentos
router.post('/alunos/:id/pagamentos', authenticateUser, authorizeRoles(['administrador', 'atendente']), pagamentosController.registrarPagamento);
router.get('/alunos/:id/pagamentos', authenticateUser, authorizeRoles(['administrador', 'atendente']), pagamentosController.getPagamentosPorAluno);

// Apenas administradores podem excluir pagamentos
router.delete('/pagamentos/:id', authenticateUser, authorizeRoles(['administrador']), pagamentosController.deletePagamento);

export default router;