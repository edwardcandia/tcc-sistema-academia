// backend/src/routes/alunosRoutes.ts
import express from "express";
import { authenticateUser, authorizeRoles } from "../middleware/auth";
import * as alunosController from "../controllers/alunosController";

const router = express.Router();

// Administradores e atendentes podem listar, cadastrar e editar alunos
router.get('/alunos', authenticateUser, authorizeRoles(['administrador', 'atendente']), alunosController.getAlunos);
router.post('/alunos', authenticateUser, authorizeRoles(['administrador', 'atendente']), alunosController.createAluno);
router.put('/alunos/:id', authenticateUser, authorizeRoles(['administrador', 'atendente']), alunosController.updateAluno);

// Apenas administradores podem excluir alunos
router.delete('/alunos/:id', authenticateUser, authorizeRoles(['administrador']), alunosController.deleteAluno);

export default router;