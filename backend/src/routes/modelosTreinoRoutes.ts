// backend/src/routes/modelosTreinoRoutes.js
import express from "express";
const router = express.Router();
const modelosTreinoController: any = require('../controllers/modelosTreinoController');
import { authenticateUser, authorizeRoles  } from "../middleware/auth";

// Rotas protegidas para administradores
router.use('/modelos-treino', authenticateUser, authorizeRoles(['administrador']));

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
router.post('/modelos-treino/alunos/:alunoId/:modeloTreinoId', authenticateUser, authorizeRoles(['administrador']), modelosTreinoController.assignModeloTreinoToAluno);
router.delete('/modelos-treino/alunos/:alunoId/:modeloTreinoId', authenticateUser, authorizeRoles(['administrador']), modelosTreinoController.removeModeloTreinoFromAluno);

// Rota para alunos consultarem seus próprios modelos de treino (autenticação removida)
router.get('/alunos/:alunoId/modelos-treino', modelosTreinoController.getModelosTreinoByAlunoId);

export default router;