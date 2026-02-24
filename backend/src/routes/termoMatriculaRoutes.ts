// backend/src/routes/termoMatriculaRoutes.ts
import express from 'express';
import * as termoMatriculaController from '../controllers/termoMatriculaController';
import { authenticateUser, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// Autenticação obrigatória para todas as rotas
router.use(authenticateUser);

// Rotas para modelos de termo
router.get('/modelos', termoMatriculaController.getTermoModelos);
router.get('/modelos/:id', termoMatriculaController.getTermoModeloById);
router.post('/modelos', authorizeRoles(['administrador']), termoMatriculaController.createTermoModelo);
router.put('/modelos/:id', authorizeRoles(['administrador']), termoMatriculaController.updateTermoModelo);
router.delete('/modelos/:id', authorizeRoles(['administrador']), termoMatriculaController.deleteTermoModelo);

// Rotas para termos de alunos
router.get('/alunos/:alunoId/termos', termoMatriculaController.getTermosAluno);
router.post('/alunos/:alunoId/termos/upload', termoMatriculaController.upload.single('arquivo'), termoMatriculaController.uploadTermoAluno);
router.get('/alunos/:alunoId/termos/:termoId/download', termoMatriculaController.downloadTermoAluno);
router.delete('/alunos/:alunoId/termos/:termoId', authorizeRoles(['administrador', 'atendente']), termoMatriculaController.deleteTermoAluno);

// Gerar PDF do termo
router.post('/alunos/:alunoId/termos/gerar/:modeloId', termoMatriculaController.generatePDF);

export default router;