// backend/src/routes/relatoriosRoutes.js
const express = require('express');
const router = express.Router();
const relatoriosController = require('../controllers/relatoriosController');
const verifyToken = require('../middleware/verifyToken');

router.get('/relatorios/novos-alunos', verifyToken, relatoriosController.getNovosAlunosPorMes);

// Novas rotas
router.get('/relatorios/alunos-por-plano', verifyToken, relatoriosController.getAlunosPorPlano);
router.get('/relatorios/status-pagamentos', verifyToken, relatoriosController.getStatusPagamentos);

module.exports = router;