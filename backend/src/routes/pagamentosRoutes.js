// backend/src/routes/pagamentosRoutes.js
const express = require('express');
const router = express.Router();
const pagamentosController = require('../controllers/pagamentosController');
const verifyToken = require('../middleware/verifyToken');

router.post('/alunos/:id/pagamentos', verifyToken, pagamentosController.registrarPagamento);
router.get('/alunos/:id/pagamentos', verifyToken, pagamentosController.getPagamentosPorAluno);

// --- NOVA ROTA ---
// Note que a rota é /pagamentos/:id (ID do pagamento), e não do aluno
router.delete('/pagamentos/:id', verifyToken, pagamentosController.deletePagamento);

module.exports = router;