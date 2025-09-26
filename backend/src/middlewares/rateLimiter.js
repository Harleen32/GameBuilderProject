const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
  windowMs: 60 * 1000,     // 1 minute
  max: 120,                // 120 req/min per IP
  standardHeaders: true,
  legacyHeaders: false
});
