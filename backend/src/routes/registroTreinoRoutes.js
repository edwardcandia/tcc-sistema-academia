// backend/src/routes/registroTreinoRoutes.js
const express = require('express');
const router = express.Router();
const registroTreinoController = require('../controllers/registroTreinoController');
const { validate, schemas } = require('../utils/validator');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Registro de Treino
 *   description: Operações administrativas para registrar e acompanhar os treinos realizados pelos alunos
 */

// Proteção com autenticação administrativa

// Registrar um novo treino realizado (apenas admin/atendente)
router.post(
  '/registrar', 
  authenticateUser,
  authorizeRoles(['administrador', 'atendente', 'instrutor']),
  validate(schemas.registroTreino),
  registroTreinoController.registrarTreino
);

// Obter histórico de treinos realizados de um aluno
router.get(
  '/historico',
  authenticateUser,
  registroTreinoController.obterHistoricoTreinos
);

// Obter histórico de treinos realizados de um aluno específico
router.get(
  '/aluno/:aluno_id',
  authenticateUser,
  authorizeRoles(['administrador', 'atendente', 'instrutor']),
  registroTreinoController.obterHistoricoTreinosAluno
);

// Obter estatísticas de treinos de um aluno
router.get(
  '/estatisticas',
  authenticateUser,
  registroTreinoController.obterEstatisticas
);

// Obter frequência semanal de treinos
router.get(
  '/frequencia',
  authenticateUser,
  registroTreinoController.obterFrequenciaSemanal
);

// Obter avaliações médias por tipo de treino
router.get(
  '/avaliacoes',
  authenticateUser,
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

module.exports = router;