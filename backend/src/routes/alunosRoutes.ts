// backend/src/routes/alunosRoutes.ts
import express from "express";
import { authenticateUser } from "../middleware/auth";
import * as alunosController from "../controllers/alunosController";

const router = express.Router();

router.get('/alunos', authenticateUser, alunosController.getAlunos);
router.post('/alunos', authenticateUser, alunosController.createAluno);
router.put('/alunos/:id', authenticateUser, alunosController.updateAluno);
router.delete('/alunos/:id', authenticateUser, alunosController.deleteAluno);

export default router;