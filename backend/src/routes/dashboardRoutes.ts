// backend/src/routes/dashboardRoutes.ts
import express from "express";
import { authenticateUser, authorizeRoles } from "../middleware/auth";
import * as dashboardController from "../controllers/dashboardController";

const router = express.Router();

// Métricas gerais — acessíveis a administradores e atendentes
router.get('/dashboard/metrics', authenticateUser, authorizeRoles(['administrador', 'atendente']), dashboardController.getMetrics);
router.get('/dashboard/aniversariantes', authenticateUser, authorizeRoles(['administrador', 'atendente']), dashboardController.getAniversariantesDoMes);
router.get('/dashboard/pagamentos-vencendo', authenticateUser, authorizeRoles(['administrador', 'atendente']), dashboardController.getPagamentosVencendo);
router.get('/dashboard/status-alunos', authenticateUser, authorizeRoles(['administrador', 'atendente']), dashboardController.getStatusAlunos);

// Inadimplência — acessível a administradores e atendentes (recepcionista precisa cobrar)
router.get('/dashboard/inadimplentes', authenticateUser, authorizeRoles(['administrador', 'atendente']), dashboardController.getInadimplentes);

// Relatórios financeiros — apenas administradores
router.get('/dashboard/estatisticas', authenticateUser, authorizeRoles(['administrador']), dashboardController.getEstatisticas);
router.get('/dashboard/distribuicao-planos', authenticateUser, authorizeRoles(['administrador']), dashboardController.getDistribuicaoPlanos);
router.get('/dashboard/historico-pagamentos', authenticateUser, authorizeRoles(['administrador']), dashboardController.getHistoricoPagamentos);

export default router;