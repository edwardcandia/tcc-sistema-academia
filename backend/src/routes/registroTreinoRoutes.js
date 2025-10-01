// backend/src/routes/registroTreinoRoutes.js
const express = require('express');
const router = express.Router();
const registroTreinoController = require('../controllers/registroTreinoController');
const verifyAlunoToken = require('../middleware/verifyAlunoToken');

// Todas as rotas precisam de autenticação do aluno
router.use(verifyAlunoToken);

// Registrar um novo treino realizado
router.post('/registrar', registroTreinoController.registrarTreino);

// Obter histórico de treinos realizados
router.get('/historico', registroTreinoController.obterHistoricoTreinos);

// Obter estatísticas de treinos
router.get('/estatisticas', registroTreinoController.obterEstatisticas);

// Excluir um registro de treino
router.delete('/:id', registroTreinoController.excluirRegistroTreino);

module.exports = router;