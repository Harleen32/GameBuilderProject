require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./apps');

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Missing MONGO_URI in environment.');
  process.exit(1);
}

async function start() {
  try {
    await mongoose.connect(MONGO_URI); // modern driver
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`API listening on ${PORT} (${process.env.NODE_ENV || 'dev'})`));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
