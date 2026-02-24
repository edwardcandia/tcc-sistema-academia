// backend/src/routes/dashboardRoutes.ts
import express from "express";
import { authenticateUser } from "../middleware/auth";
import * as dashboardController from "../controllers/dashboardController";

const router = express.Router();

router.use(authenticateUser);

router.get('/dashboard/metrics', dashboardController.getMetrics);
router.get('/dashboard/aniversariantes', dashboardController.getAniversariantesDoMes);
router.get('/dashboard/pagamentos-vencendo', dashboardController.getPagamentosVencendo);
router.get('/dashboard/estatisticas', dashboardController.getEstatisticas);
router.get('/dashboard/status-alunos', dashboardController.getStatusAlunos);
router.get('/dashboard/distribuicao-planos', dashboardController.getDistribuicaoPlanos);
router.get('/dashboard/historico-pagamentos', dashboardController.getHistoricoPagamentos);

export default router;