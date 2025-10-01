// backend/src/routes/modelosTreinoRoutes.js
const express = require('express');
const router = express.Router();
const modelosTreinoController = require('../controllers/modelosTreinoController');
const verifyToken = require('../middleware/verifyToken');
const verifyAlunoToken = require('../middleware/verifyAlunoToken');
const authorizeRole = require('../middleware/authorizeRole');

// Rotas protegidas para administradores
router.use('/modelos-treino', verifyToken, authorizeRole(['administrador']));

router.route('/modelos-treino')
    .post(modelosTreinoController.createModeloTreino)
    .get(modelosTreinoController.getAllModelosTreino);

router.route('/modelos-treino/:id')
    .get(modelosTreinoController.getModeloTreinoById)
    .delete(modelosTreinoController.deleteModeloTreino);

router.post('/modelos-treino/:id/exercicios', modelosTreinoController.addExercicioAoModelo);
router.delete('/modelos-treino/exercicios/:exercicioDoModeloId', modelosTreinoController.removeExercicioDoModelo);
router.post('/modelos-treino/:id/duplicar', modelosTreinoController.duplicateModeloTreino);

// Rotas para atribuição de modelos a alunos (apenas para administradores)
router.post('/modelos-treino/alunos/:alunoId/:modeloTreinoId', verifyToken, authorizeRole(['administrador']), modelosTreinoController.assignModeloTreinoToAluno);
router.delete('/modelos-treino/alunos/:alunoId/:modeloTreinoId', verifyToken, authorizeRole(['administrador']), modelosTreinoController.removeModeloTreinoFromAluno);

// Rota para alunos consultarem seus próprios modelos de treino (usa verificação de token de aluno)
router.get('/alunos/:alunoId/modelos-treino', verifyAlunoToken, modelosTreinoController.getModelosTreinoByAlunoId);

module.exports = router;