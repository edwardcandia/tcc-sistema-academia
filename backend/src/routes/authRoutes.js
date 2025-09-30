// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota para registrar um novo usuário (deve ser pública ou protegida para admins)
// Para o nosso caso de setup inicial, vamos mantê-la pública.
router.post('/auth/register', authController.registerUser);

// Rota para fazer login (pública)
router.post('/auth/login', authController.loginUser);

module.exports = router;