// backend/src/routes/alunosModelosRoutes.ts
import express from "express";
import { authenticateUser, authorizeRoles } from "../middleware/auth";
import * as alunosModelosController from "../controllers/alunosModelosController";

const router = express.Router();

// Apenas administradores e atendentes podem associar modelos a alunos
router.post(
    '/alunos-modelos',
    authenticateUser,
    authorizeRoles(['administrador', 'atendente']),
    alunosModelosController.associarModeloAoAluno
);

// Buscar todos os modelos de um aluno específico
router.get(
    '/alunos/:aluno_id/modelos',
    authenticateUser,
    authorizeRoles(['administrador', 'atendente']),
    alunosModelosController.getModelosDoAluno
);

// Buscar todos os alunos de um modelo específico
router.get(
    '/modelos/:modelo_id/alunos',
    authenticateUser,
    authorizeRoles(['administrador', 'atendente']),
    alunosModelosController.getAlunosDoModelo
);

// Atualizar uma associação existente
router.put(
    '/alunos-modelos/:id',
    authenticateUser,
    authorizeRoles(['administrador', 'atendente']),
    alunosModelosController.atualizarAssociacao
);

// Remover uma associação
router.delete(
    '/alunos-modelos/:id',
    authenticateUser,
    authorizeRoles(['administrador', 'atendente']),
    alunosModelosController.removerAssociacao
);

// Listar todas as associações (útil para dashboards)
router.get(
    '/alunos-modelos',
    authenticateUser,
    authorizeRoles(['administrador', 'atendente']),
    alunosModelosController.getAllAssociacoes
);

export default router;
