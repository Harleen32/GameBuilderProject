// src/routes/projects.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/projects.controller');

router.post('/', ctrl.create);
router.get('/:id', ctrl.get);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
