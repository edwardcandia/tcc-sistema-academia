// backend/src/routes/exerciciosRoutes.ts
import express from "express";
import { authenticateUser, authorizeRoles } from "../middleware/auth";
import * as exerciciosController from "../controllers/exerciciosController";
import { Request, Response } from 'express';

const router = express.Router();

// Rota pública para obter a lista de grupos musculares válidos
router.get('/exercicios/grupos', (req: Request, res: Response) => {
    res.json({ grupos: exerciciosController.GRUPOS_MUSCULARES });
});

// Rotas que permitem visualização por instrutores e administradores
router.get('/exercicios', authenticateUser, authorizeRoles(['administrador', 'instrutor']), exerciciosController.getAllExercicios);
router.get('/exercicios/:id', authenticateUser, authorizeRoles(['administrador', 'instrutor']), exerciciosController.getExercicioById);
router.get('/exercicios/grupo/:grupo', authenticateUser, authorizeRoles(['administrador', 'instrutor']), exerciciosController.getExerciciosByGrupo);

// Rotas que permitem modificação apenas por administradores
router.post('/exercicios', authenticateUser, authorizeRoles(['administrador']), exerciciosController.createExercicio);
router.put('/exercicios/:id', authenticateUser, authorizeRoles(['administrador']), exerciciosController.updateExercicio);
router.delete('/exercicios/:id', authenticateUser, authorizeRoles(['administrador']), exerciciosController.deleteExercicio);

export default router;