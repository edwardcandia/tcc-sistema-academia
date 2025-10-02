// backend/src/routes/aulasRoutes.js
const express = require('express');
const router = express.Router();
const aulasController = require('../controllers/aulasController');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');

// Rotas para administradores e instrutores
router.get('/tipos', authenticateUser, aulasController.listarTiposAula);
router.post('/tipos', authenticateUser, authorizeRoles(['administrador']), aulasController.criarTipoAula);

router.post('/', authenticateUser, authorizeRoles(['administrador', 'instrutor']), aulasController.agendarAula);
router.get('/', authenticateUser, aulasController.listarAulas);
router.get('/:id', authenticateUser, aulasController.obterAula);
router.patch('/:id/status', authenticateUser, authorizeRoles(['administrador', 'instrutor']), aulasController.atualizarStatusAula);

// Rotas administrativas para gerenciar inscrições de alunos
router.get('/inscricoes/:aluno_id', authenticateUser, aulasController.listarAulasAluno);
router.post('/inscricoes', authenticateUser, authorizeRoles(['administrador', 'atendente']), aulasController.inscreverEmAula);
router.patch('/inscricoes/cancelar/:aula_id', authenticateUser, authorizeRoles(['administrador', 'atendente']), aulasController.cancelarInscricao);

module.exports = router;