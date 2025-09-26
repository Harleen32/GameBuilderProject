require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Template = require('../models/Template');

const MONGO_URI = process.env.MONGO_URI;

(async () => {
  try {
    if (!MONGO_URI) throw new Error('MONGO_URI missing');
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    const dir = path.resolve(__dirname, './templates');
    if (!fs.existsSync(dir)) throw new Error(`Seed dir not found: ${dir}`);

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    console.log('Files:', files);

    let count = 0;
    for (const f of files) {
      const raw = fs.readFileSync(path.join(dir, f), 'utf8');
      const data = JSON.parse(raw);
      const doc = {
        name: data.name || f.replace('.json', ''),
        description: data.description || `Seeded from ${f}`,
        thumbnailUrl: data.thumbnailUrl || '',
        tags: data.tags || [],
        data
      };
      await Template.findOneAndUpdate({ name: doc.name }, doc, { upsert: true, new: true });
      count++;
    }
    console.log(`Seed complete: ${count} templates`);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
