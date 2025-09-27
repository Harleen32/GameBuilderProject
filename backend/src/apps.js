require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('express-async-errors');

const templatesRoutes = require('./routes/templates.routes');
const projectsRoutes  = require('./routes/projects.routes');
const aiRoutes        = require('./routes/ai.routes');
const errorHandler    = require('./middlewares/errorHandler');
const rateLimiter     = require('./middlewares/rateLimiter');

const app = express();

// Security & performance
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ✅ Updated CORS with deployed frontend URL
const allowed = [
  'http://localhost:3000', 
  'https://game-builder-project-pvrn.vercel.app' // your Vercel frontend URL
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // allow curl/postman/no origin
      if (allowed.includes(origin)) return cb(null, true);
      cb(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);

// Static (optional)
app.use('/uploads', express.static('uploads'));

// Rate limit whole API
app.use('/api', rateLimiter);

// API Routes
app.use('/api/templates', templatesRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ✅ Root route for Render health check
app.get('/', (_req, res) => {
  res.send('Backend is running 🚀');
});

// Error handling MUST stay last
app.use(errorHandler);

module.exports = app;
