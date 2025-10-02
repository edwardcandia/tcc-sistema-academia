// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route for registering a new admin/attendant
router.post('/auth/register', authController.registerUser);

// Rota para verificar se o token é válido
router.get('/auth/verify-token', authController.verifyToken);

// Unified login route for all user types
router.post('/login', authController.login);

module.exports = router;