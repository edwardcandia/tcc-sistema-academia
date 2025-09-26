// backend/src/routes/alunosRoutes.js
const express = require('express');
const router = express.Router();
const alunosController = require('../controllers/alunosController');
const verifyToken = require('../middleware/verifyToken'); // 1. Importa o middleware

// 2. Protege todas as rotas de alunos
router.get('/alunos', verifyToken, alunosController.getAlunos);
router.post('/alunos', verifyToken, alunosController.createAluno);
router.put('/alunos/:id', verifyToken, alunosController.updateAluno);
router.delete('/alunos/:id', verifyToken, alunosController.deleteAluno);

module.exports = router;