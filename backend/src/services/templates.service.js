// src/services/templates.service.js
const Template = require('../models/Template');

async function listTemplates({ page = 1, limit = 12, tag, search }) {
  const filter = {};
  if (tag) filter.tags = tag;
  if (search) filter.name = new RegExp(search, 'i');
  const skip = (page - 1) * limit;
  const items = await Template.find(filter, 'name description thumbnailUrl tags').sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
  const total = await Template.countDocuments(filter);
  return { items, total, page, limit };
}

async function getTemplate(id) {
  const t = await Template.findById(id).lean();
  if (!t) throw Object.assign(new Error('Template not found'), { status: 404 });
  return t;
}

async function createTemplate(payload) {
  const t = new Template(payload);
  await t.save();
  return t;
}

async function deleteTemplate(id) {
  await Template.findByIdAndDelete(id);
}

module.exports = { listTemplates, getTemplate, createTemplate, deleteTemplate };
