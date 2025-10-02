// backend/src/routes/relatoriosRoutes.js
const express = require('express');
const router = express.Router();
const relatoriosController = require('../controllers/relatoriosController');
const verifyToken = require('../middleware/verifyToken');
const authorizeRole = require('../middleware/authorizeRole');

// Apenas administradores podem ver os relatórios
router.get('/relatorios/novos-alunos', verifyToken, authorizeRole(['administrador']), relatoriosController.getNovosAlunosPorMes);
router.get('/relatorios/alunos-por-plano', verifyToken, authorizeRole(['administrador']), relatoriosController.getAlunosPorPlano);
router.get('/relatorios/status-pagamentos', verifyToken, authorizeRole(['administrador']), relatoriosController.getStatusPagamentos);

// Novos relatórios avançados
router.get('/relatorios/frequencia-alunos', verifyToken, authorizeRole(['administrador']), relatoriosController.getFrequenciaAlunos);
router.get('/relatorios/receitas', verifyToken, authorizeRole(['administrador']), relatoriosController.getReceitas);
router.get('/relatorios/receitas-ultimos-meses', verifyToken, authorizeRole(['administrador']), relatoriosController.getReceitasUltimosMeses);
router.get('/relatorios/desempenho-treinos', verifyToken, authorizeRole(['administrador']), relatoriosController.getDesempenhoTreinos);
router.get('/relatorios/dashboard', verifyToken, authorizeRole(['administrador']), relatoriosController.getDashboardData);

module.exports = router;