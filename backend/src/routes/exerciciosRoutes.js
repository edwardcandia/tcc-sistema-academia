// backend/src/routes/exerciciosRoutes.js
const express = require('express');
const router = express.Router();
const exerciciosController = require('../controllers/exerciciosController');
const verifyToken = require('../middleware/verifyToken');
const authorizeRole = require('../middleware/authorizeRole');

// Rota pública para obter a lista de grupos musculares válidos
router.get('/exercicios/grupos', (req, res) => {
    res.json({ grupos: exerciciosController.GRUPOS_MUSCULARES });
});

// Rotas protegidas que exigem autenticação

// Rotas que permitem visualização por instrutores e administradores
router.get('/exercicios', verifyToken, authorizeRole(['administrador', 'instrutor']), exerciciosController.getAllExercicios);
router.get('/exercicios/:id', verifyToken, authorizeRole(['administrador', 'instrutor']), exerciciosController.getExercicioById);
router.get('/exercicios/grupo/:grupo', verifyToken, authorizeRole(['administrador', 'instrutor']), exerciciosController.getExerciciosByGrupo);

// Rotas que permitem modificação apenas por administradores
router.post('/exercicios', verifyToken, authorizeRole(['administrador']), exerciciosController.createExercicio);
router.put('/exercicios/:id', verifyToken, authorizeRole(['administrador']), exerciciosController.updateExercicio);
router.delete('/exercicios/:id', verifyToken, authorizeRole(['administrador']), exerciciosController.deleteExercicio);

module.exports = router;