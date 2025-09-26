// backend/src/routes/pagamentosRoutes.js
const express = require('express');
const router = express.Router();
const pagamentosController = require('../controllers/pagamentosController');
const verifyToken = require('../middleware/verifyToken');

router.post('/alunos/:id/pagamentos', verifyToken, pagamentosController.registrarPagamento);

module.exports = router;