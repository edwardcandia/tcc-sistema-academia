// backend/src/routes/termoMatriculaRoutes.ts
import express from 'express';
import * as termoMatriculaController from '../controllers/termoMatriculaController';
import verifyToken from '../middleware/verifyToken';
import authorizeRole from '../middleware/authorizeRole';

const router = express.Router();

// Middleware to check authentication for all routes
router.use(verifyToken);

// Routes for term templates (modelos)
router.get('/modelos', termoMatriculaController.getTermoModelos);
router.get('/modelos/:id', termoMatriculaController.getTermoModeloById);
router.post('/modelos', authorizeRole(['admin']), termoMatriculaController.createTermoModelo);
router.put('/modelos/:id', authorizeRole(['admin']), termoMatriculaController.updateTermoModelo);
router.delete('/modelos/:id', authorizeRole(['admin']), termoMatriculaController.deleteTermoModelo);

// Routes for student terms
router.get('/alunos/:alunoId/termos', termoMatriculaController.getTermosAluno);
router.post('/alunos/:alunoId/termos/upload', termoMatriculaController.upload.single('arquivo'), termoMatriculaController.uploadTermoAluno);
router.get('/alunos/:alunoId/termos/:termoId/download', termoMatriculaController.downloadTermoAluno);
router.delete('/alunos/:alunoId/termos/:termoId', authorizeRole(['admin', 'funcionario']), termoMatriculaController.deleteTermoAluno);

// Generate PDF term
router.post('/alunos/:alunoId/termos/gerar/:modeloId', termoMatriculaController.generatePDF);

export default router;