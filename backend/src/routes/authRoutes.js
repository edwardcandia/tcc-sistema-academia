// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota para registrar um novo usuário (ex: POST /api/auth/register)
router.post('/auth/register', authController.registerUser);

// Rota para fazer login (ex: POST /api/auth/login)
router.post('/auth/login', authController.loginUser);

module.exports = router;