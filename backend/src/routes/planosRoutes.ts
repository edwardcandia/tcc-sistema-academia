// backend/src/routes/planosRoutes.js
import express from "express";
const router = express.Router();
import planosController from "../controllers/planosController";
import verifyToken from "../middleware/verifyToken";
import authorizeRole from "../middleware/authorizeRole";

// Listar planos continua público para o formulário de alunos funcionar
router.get('/planos', planosController.getPlanos);

// Apenas administradores podem criar, atualizar ou deletar planos
router.post('/planos', verifyToken, authorizeRole(['administrador']), planosController.createPlano);
router.put('/planos/:id', verifyToken, authorizeRole(['administrador']), planosController.updatePlano);
router.delete('/planos/:id', verifyToken, authorizeRole(['administrador']), planosController.deletePlano);

export default router;