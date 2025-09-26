// src/controllers/ai.controller.js
const aiService = require('../services/ai.service');
const projectsService = require('../services/projects.service');

async function generate(req, res) {
  const { prompt, templateType } = req.body || {};
  const data = aiService.generateFromPrompt(prompt || '', templateType);
  // auto-save as project
  const project = await projectsService.createProject({ name: data.name || 'AI Project', data });
  res.json({ id: project._id, name: project.name, data: project.data });
}

module.exports = { generate };
