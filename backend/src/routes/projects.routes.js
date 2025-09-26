/**
 * src/routes/projects.routes.js
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/projects.controller');

// Create a new project (save)
router.post('/', ctrl.create);

// Read a project by id
router.get('/:id', ctrl.get);

// Update a project by id
router.put('/:id', ctrl.update);

// Delete a project by id
router.delete('/:id', ctrl.remove);

module.exports = router;
