// src/controllers/templates.controller.js
const service = require('../services/templates.service');

async function list(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const tag = req.query.tag;
  const search = req.query.search;
  const result = await service.listTemplates({ page, limit, tag, search });
  res.json(result);
}

async function get(req, res) {
  const t = await service.getTemplate(req.params.id);
  res.json(t);
}

async function create(req, res) {
  const payload = req.body;
  const t = await service.createTemplate(payload);
  res.status(201).json(t);
}

async function remove(req, res) {
  await service.deleteTemplate(req.params.id);
  res.json({ ok: true });
}

module.exports = { list, get, create, remove };
