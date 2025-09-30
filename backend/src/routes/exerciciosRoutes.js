// backend/src/routes/exerciciosRoutes.js
const express = require('express');
const router = express.Router();
const exerciciosController = require('../controllers/exerciciosController');
const verifyToken = require('../middleware/verifyToken');
const authorizeRole = require('../middleware/authorizeRole');

// Protege todas as rotas de exercícios para serem acessíveis apenas por administradores
router.use(verifyToken, authorizeRole(['administrador']));

router.route('/exercicios')
    .post(exerciciosController.createExercicio)
    .get(exerciciosController.getAllExercicios);

router.route('/exercicios/:id')
    .put(exerciciosController.updateExercicio)
    .delete(exerciciosController.deleteExercicio);

module.exports = router;