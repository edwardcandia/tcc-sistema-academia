// backend/src/routes/planosRoutes.ts
import express from "express";
import { authenticateUser, authorizeRoles } from "../middleware/auth";
import * as planosController from "../controllers/planosController";

const router = express.Router();

// GET planos é público para o formulário de cadastro de alunos funcionar
router.get('/planos', planosController.getPlanos);

// Apenas administradores podem criar, atualizar ou deletar planos
router.post('/planos', authenticateUser, authorizeRoles(['administrador']), planosController.createPlano);
router.put('/planos/:id', authenticateUser, authorizeRoles(['administrador']), planosController.updatePlano);
router.delete('/planos/:id', authenticateUser, authorizeRoles(['administrador']), planosController.deletePlano);

export default router;