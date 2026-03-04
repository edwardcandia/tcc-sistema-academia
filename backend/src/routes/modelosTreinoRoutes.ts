// backend/src/routes/modelosTreinoRoutes.ts
import express from "express";
import * as modelosTreinoController from "../controllers/modelosTreinoController";
import { authenticateUser, authorizeRoles } from "../middleware/auth";

const router = express.Router();

// Rotas protegidas para administradores e atendentes
router.use('/modelos-treino', authenticateUser, authorizeRoles(['administrador', 'atendente']));

router.route('/modelos-treino')
    .post(modelosTreinoController.createModeloTreino)
    .get(modelosTreinoController.getAllModelosTreino);

router.route('/modelos-treino/:id')
    .get(modelosTreinoController.getModeloTreinoById)
    .delete(modelosTreinoController.deleteModeloTreino);

router.post('/modelos-treino/:id/exercicios', modelosTreinoController.addExercicioAoModelo);
router.delete('/modelos-treino/exercicios/:exercicioDoModeloId', modelosTreinoController.removeExercicioDoModelo);
router.post('/modelos-treino/:id/duplicar', modelosTreinoController.duplicateModeloTreino);

// Rota para buscar modelos de treino de um aluno (mantida aqui por compatibilidade)
// NOTA: Para associar/desassociar modelos de alunos, use as rotas em alunosModelosRoutes
router.get('/alunos/:alunoId/modelos-treino', modelosTreinoController.getModelosTreinoByAlunoId);

export default router;