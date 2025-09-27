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

/* ---------------------------
   Security & performance
---------------------------- */
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

/* ---------------------------
   CORS — localhost, prod Vercel, Vercel previews
---------------------------- */
const PROD_VERCEL = 'https://game-builder-project-pvrn.vercel.app';

function isAllowedOrigin(origin) {
  if (!origin) return true; // curl/postman/health checks (no Origin header)
  if (origin === PROD_VERCEL) return true;

  // Vercel preview deployments for this project, e.g.:
  // https://game-builder-project-pvrn-somehash-harleens-projects-a29d32a9.vercel.app
  const previewRe = /^https:\/\/game-builder-project-pvrn-[a-z0-9-]+\.vercel\.app$/i;
  if (previewRe.test(origin)) return true;

  // Any localhost port
  if (/^http:\/\/localhost:\d+$/i.test(origin)) return true;

  return false;
}

app.use(
  cors({
    origin: (origin, cb) => (isAllowedOrigin(origin) ? cb(null, true) : cb(new Error(`Not allowed by CORS: ${origin}`))),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Ensure OPTIONS preflights succeed
app.options('*', cors());

/* ---------------------------
   Static & rate limit
---------------------------- */
app.use('/uploads', express.static('uploads'));
app.use('/api', rateLimiter);

/* ---------------------------
   Routes
---------------------------- */
app.use('/api/templates', templatesRoutes);
app.use('/api/projects',  projectsRoutes);
app.use('/api/ai',        aiRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Root (Render health/home)
app.get('/', (_req, res) => {
  res.send('Backend is running 🚀');
});

/* ---------------------------
   Error handling (last)
---------------------------- */
app.use(errorHandler);

module.exports = app;
