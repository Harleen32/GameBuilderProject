const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TemplateSchema = new Schema({
  name: { type: String, required: true, index: true },
  description: { type: String, default: '' },
  tags: { type: [String], default: [], index: true },
  author: { type: String, default: 'system' },
  thumbnailUrl: { type: String, default: '' },
  data: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

TemplateSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Template', TemplateSchema);
