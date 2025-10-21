// backend/src/routes/alunosRoutes.js
import express from "express";
const router = express.Router();
import alunosController from "../controllers/alunosController";
import verifyToken from "../middleware/verifyToken"; // 1. Importa o middleware

// 2. Protege todas as rotas de alunos
router.get('/alunos', verifyToken, alunosController.getAlunos);
router.post('/alunos', verifyToken, alunosController.createAluno);
router.put('/alunos/:id', verifyToken, alunosController.updateAluno);
router.delete('/alunos/:id', verifyToken, alunosController.deleteAluno);

export default router;