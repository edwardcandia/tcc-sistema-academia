// backend/src/routes/dashboardRoutes.js
import express from "express";
const router = express.Router();
import dashboardController from "../controllers/dashboardController";
import verifyToken from "../middleware/verifyToken";

// Aplicar middleware de verificação de token para todas as rotas do dashboard
router.use(verifyToken);

// Rota original usada pelo componente Dashboard.jsx
router.get('/dashboard/metrics', dashboardController.getMetrics);

// Rotas para informações extras do dashboard
router.get('/dashboard/aniversariantes', dashboardController.getAniversariantesDoMes);
router.get('/dashboard/pagamentos-vencendo', dashboardController.getPagamentosVencendo);

// Novas rotas para os gráficos e estatísticas
router.get('/dashboard/estatisticas', dashboardController.getEstatisticas);
router.get('/dashboard/status-alunos', dashboardController.getStatusAlunos);
router.get('/dashboard/distribuicao-planos', dashboardController.getDistribuicaoPlanos);
router.get('/dashboard/historico-pagamentos', dashboardController.getHistoricoPagamentos);

export default router;