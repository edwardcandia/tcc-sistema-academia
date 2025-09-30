// backend/src/routes/portalRoutes.js
const express = require('express');
const router = express.Router();
const portalController = require('../controllers/portalController');
const verifyAlunoToken = require('../middleware/verifyAlunoToken');

// Rotas públicas para o portal do aluno
router.post('/portal/definir-senha', portalController.definirSenhaAluno);
router.post('/portal/login', portalController.loginAluno);

// Rotas protegidas (apenas para alunos logados)
router.get('/portal/meus-dados', verifyAlunoToken, portalController.getMeusDados);
router.get('/portal/meus-pagamentos', verifyAlunoToken, portalController.getMeuHistoricoPagamentos);

module.exports = router;