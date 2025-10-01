// backend/src/routes/modelosTreinoRoutes.js
const express = require('express');
const router = express.Router();
const modelosTreinoController = require('../controllers/modelosTreinoController');
const verifyToken = require('../middleware/verifyToken');
const authorizeRole = require('../middleware/authorizeRole');

router.use(verifyToken, authorizeRole(['administrador']));

router.route('/modelos-treino')
    .post(modelosTreinoController.createModeloTreino)
    .get(modelosTreinoController.getAllModelosTreino);

router.route('/modelos-treino/:id')
    .get(modelosTreinoController.getModeloTreinoById)
    .delete(modelosTreinoController.deleteModeloTreino);

router.post('/modelos-treino/:id/exercicios', modelosTreinoController.addExercicioAoModelo);
router.delete('/modelos-treino/exercicios/:exercicioDoModeloId', modelosTreinoController.removeExercicioDoModelo);

module.exports = router;