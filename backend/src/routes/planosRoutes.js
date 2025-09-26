// backend/src/routes/planosRoutes.js
const express = require('express');
const router = express.Router();
const planosController = require('../controllers/planosController');
const verifyToken = require('../middleware/verifyToken'); // 1. Importa o middleware

// A rota GET para listar planos pode continuar pública ou ser protegida.
// Vamos mantê-la pública por enquanto para que a lógica do frontend não quebre imediatamente.
router.get('/planos', planosController.getPlanos);

// 2. Adiciona o verifyToken como um passo intermediário para proteger as rotas de escrita
router.post('/planos', verifyToken, planosController.createPlano);
router.put('/planos/:id', verifyToken, planosController.updatePlano);
router.delete('/planos/:id', verifyToken, planosController.deletePlano);

module.exports = router;