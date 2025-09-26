// src/routes/ai.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ai.controller');

router.post('/generate', ctrl.generate);

module.exports = router;
