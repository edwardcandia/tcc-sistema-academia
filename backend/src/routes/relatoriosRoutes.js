// backend/src/routes/relatoriosRoutes.js
const express = require('express');
const router = express.Router();
const relatoriosController = require('../controllers/relatoriosController');
const verifyToken = require('../middleware/verifyToken');

// Protege a rota de relatórios com o middleware de verificação de token
router.get('/relatorios/novos-alunos', verifyToken, relatoriosController.getNovosAlunosPorMes);

module.exports = router;