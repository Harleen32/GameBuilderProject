// src/controllers/projects.controller.js
const service = require('../services/projects.service');

async function create(req, res) {
  const p = await service.createProject(req.body);
  res.status(201).json({ id: p._id });
}

async function get(req, res) {
  const p = await service.getProject(req.params.id);
  res.json(p);
}

async function update(req, res) {
  await service.updateProject(req.params.id, req.body);
  res.json({ ok: true });
}

async function remove(req, res) {
  await service.deleteProject(req.params.id);
  res.json({ ok: true });
}

module.exports = { create, get, update, remove };
