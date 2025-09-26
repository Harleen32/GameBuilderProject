// src/models/Project.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  name: { type: String, default: 'Untitled Project' },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', sparse: true },
  data: { type: Schema.Types.Mixed, default: {} },
  public: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
