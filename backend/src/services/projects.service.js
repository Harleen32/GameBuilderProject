// src/services/projects.service.js
const Project = require('../models/Project');

async function createProject(payload) {
  const p = new Project(payload);
  await p.save();
  return p;
}

async function getProject(id) {
  const p = await Project.findById(id).lean();
  if (!p) throw Object.assign(new Error('Project not found'), { status: 404 });
  return p;
}

async function updateProject(id, payload) {
  await Project.findByIdAndUpdate(id, payload);
}

async function deleteProject(id) {
  await Project.findByIdAndDelete(id);
}

module.exports = { createProject, getProject, updateProject, deleteProject };
