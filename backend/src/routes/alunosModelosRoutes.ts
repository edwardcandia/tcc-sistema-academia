// backend/src/routes/alunosModelosRoutes.ts
import express from "express";
import { authenticateUser, authorizeRoles } from "../middleware/auth";
import * as alunosModelosController from "../controllers/alunosModelosController";

const router = express.Router();

/**
 * @swagger
 * /api/alunos-modelos:
 *   post:
 *     summary: Associa um modelo de treino a um aluno
 *     tags: [AlunosModelos]
 */
router.post(
    '/',
    authenticateUser,
    authorizeRoles(['administrador', 'atendente']),
    alunosModelosController.associarModeloAoAluno
);

/**
 * @swagger
 * /api/alunos-modelos/aluno/{aluno_id}:
 *   get:
 *     summary: Busca todos os modelos de um aluno específico
 *     tags: [AlunosModelos]
 */
router.get(
    '/aluno/:aluno_id',
    authenticateUser,
    authorizeRoles(['administrador', 'atendente']),
    alunosModelosController.getModelosDoAluno
);

/**
 * @swagger
 * /api/alunos-modelos/modelo/{modelo_id}:
 *   get:
 *     summary: Busca todos os alunos de um modelo específico
 *     tags: [AlunosModelos]
 */
router.get(
    '/modelo/:modelo_id',
    authenticateUser,
    authorizeRoles(['administrador', 'atendente']),
    alunosModelosController.getAlunosDoModelo
);

/**
 * @swagger
 * /api/alunos-modelos/{id}:
 *   put:
 *     summary: Atualiza uma associação existente
 *     tags: [AlunosModelos]
 */
router.put(
    '/:id',
    authenticateUser,
    authorizeRoles(['administrador', 'atendente']),
    alunosModelosController.atualizarAssociacao
);

/**
 * @swagger
 * /api/alunos-modelos/{id}:
 *   delete:
 *     summary: Remover uma associação
 *     tags: [AlunosModelos]
 */
router.delete(
    '/:id',
    authenticateUser,
    authorizeRoles(['administrador', 'atendente']),
    alunosModelosController.removerAssociacao
);

/**
 * @swagger
 * /api/alunos-modelos:
 *   get:
 *     summary: Listar todas as associações
 *     tags: [AlunosModelos]
 */
router.get(
    '/',
    authenticateUser,
    authorizeRoles(['administrador', 'atendente']),
    alunosModelosController.getAllAssociacoes
);

export default router;
