// backend/src/routes/planosRoutes.js
const express = require('express');
const router = express.Router();
const planosController = require('../controllers/planosController');
const verifyToken = require('../middleware/verifyToken');
const authorizeRole = require('../middleware/authorizeRole');

// Listar planos continua público para o formulário de alunos funcionar
router.get('/planos', planosController.getPlanos);

// Apenas administradores podem criar, atualizar ou deletar planos
router.post('/planos', verifyToken, authorizeRole(['administrador']), planosController.createPlano);
router.put('/planos/:id', verifyToken, authorizeRole(['administrador']), planosController.updatePlano);
router.delete('/planos/:id', verifyToken, authorizeRole(['administrador']), planosController.deletePlano);

module.exports = router;