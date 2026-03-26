// backend/src/routes/registroTreinoRoutes.ts
import express from "express";
import * as registroTreinoController from "../controllers/registroTreinoController";
import { validate, schemas } from "../utils/validator";
import { authenticateUser, authorizeRoles, authenticateAny } from "../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Registro de Treino
 *   description: Operações para registrar e acompanhar os treinos realizados pelos alunos
 */

// Registrar um novo treino realizado (admin/atendente/instrutor ou o próprio aluno)
router.post(
  '/registrar', 
  authenticateAny,
  (req, res, next) => {
    // Se for funcionário (user), verifica se tem papel autorizado. Se for aluno, segue adiante.
    if (req.user && !['administrador', 'atendente', 'instrutor'].includes(req.user.cargo || '')) {
      return res.status(403).json({ error: 'Permissão insuficiente para esta operação.' });
    }
    next();
  },
  validate(schemas.registroTreino),
  registroTreinoController.registrarTreino
);

// Obter histórico de treinos realizados (acessível por funcionários ou pelo próprio aluno)
router.get(
  '/historico',
  authenticateAny,
  registroTreinoController.obterHistoricoTreinos
);

// Obter histórico de treinos realizados de um aluno específico (apenas funcionários)
router.get(
  '/aluno/:aluno_id',
  authenticateUser,
  authorizeRoles(['administrador', 'atendente', 'instrutor']),
  registroTreinoController.obterHistoricoTreinosAluno
);

// Obter estatísticas de treinos de um aluno (acessível por funcionários ou pelo próprio aluno)
router.get(
  '/estatisticas',
  authenticateAny,
  registroTreinoController.obterEstatisticas
);

// Obter frequência semanal de treinos (acessível por funcionários ou pelo próprio aluno)
router.get(
  '/frequencia',
  authenticateAny,
  registroTreinoController.obterFrequenciaSemanal
);

// Obter avaliações médias por tipo de treino (acessível por funcionários ou pelo próprio aluno)
router.get(
  '/avaliacoes',
  authenticateAny,
  registroTreinoController.obterAvaliacoes
);

// Excluir um registro de treino - desativado temporariamente
// router.delete(
//   '/:id',
//   authenticateUser,
//   authorizeRoles(['administrador', 'atendente', 'instrutor']),
//   validate(schemas.id),
//   registroTreinoController.excluirRegistroTreino
// );

export default router;