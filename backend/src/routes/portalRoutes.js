// backend/src/routes/portalRoutes.js
const express = require('express');
const router = express.Router();
const portalController = require('../controllers/portalController');
const verifyAlunoToken = require('../middleware/verifyAlunoToken');

// A rota de login foi REMOVIDA daqui
router.post('/portal/definir-senha', portalController.definirSenhaAluno);

router.get('/portal/meus-dados', verifyAlunoToken, portalController.getMeusDados);
router.get('/portal/meus-pagamentos', verifyAlunoToken, portalController.getMeuHistoricoPagamentos);

module.exports = router;