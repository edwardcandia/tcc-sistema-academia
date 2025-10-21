// backend/src/routes/pagamentosRoutes.js
import express from "express";
const router = express.Router();
import pagamentosController from "../controllers/pagamentosController";
import verifyToken from "../middleware/verifyToken";

router.post('/alunos/:id/pagamentos', verifyToken, pagamentosController.registrarPagamento);
router.get('/alunos/:id/pagamentos', verifyToken, pagamentosController.getPagamentosPorAluno);

// --- NOVA ROTA ---
// Note que a rota é /pagamentos/:id (ID do pagamento), e não do aluno
router.delete('/pagamentos/:id', verifyToken, pagamentosController.deletePagamento);

export default router;