// backend/src/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/dashboard/metrics', dashboardController.getMetrics);

module.exports = router;