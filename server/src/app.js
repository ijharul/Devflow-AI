const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

require('./config/passport'); // initialize Google strategy
const passport = require('passport');
const authRoutes = require('./routes/authRoutes');
const systemDesignRoutes = require('./routes/systemDesignRoutes');
const devopsRoutes = require('./routes/devopsRoutes');
const chatRoutes = require('./routes/chatRoutes');
const codeAnalyzerRoutes = require('./routes/codeAnalyzerRoutes');
const githubRoutes = require('./routes/githubRoutes');
const historyRoutes = require('./routes/historyRoutes');
const errorDebuggerRoutes = require('./routes/errorDebuggerRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const whatIfRoutes = require('./routes/whatIfRoutes');
const architectureComparisonRoutes = require('./routes/architectureComparisonRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS — allow frontend origin
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Request logging (skip in test)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '100kb' }));

// Request sanitizer — strip null bytes and template injection fragments
app.use((req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    const sanitize = (obj) => {
      for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key].replace(/\$\{/g, '').replace(/\0/g, '').trim();
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitize(obj[key]);
        }
      }
    };
    sanitize(req.body);
  }
  next();
});

// Supplemental security headers for every API response
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Passport (no session — we use JWT)
app.use(passport.initialize());

// Dedicated auth rate limiter — stricter to slow brute-force attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please wait 15 minutes.' },
  skipSuccessfulRequests: true,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Global rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// AI endpoints get a tighter limiter to protect Groq quota
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'AI rate limit reached. Please wait a moment.' },
});
app.use('/api/system-design', aiLimiter);
app.use('/api/devops', aiLimiter);
app.use('/api/chat', aiLimiter);
app.use('/api/code', aiLimiter);
// Apply AI limiter to all GitHub repo AI operations (excludes /auth routes)
app.use('/api/github/repos', aiLimiter);
app.use('/api/debug', aiLimiter);
app.use('/api/interview', aiLimiter);
app.use('/api/whatif', aiLimiter);
app.use('/api/compare', aiLimiter);

// Health check
app.get('/api/health', (_req, res) => res.json({ success: true, message: 'DevFlow AI API is running' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/system-design', systemDesignRoutes);
app.use('/api/devops', devopsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/code', codeAnalyzerRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/debug', errorDebuggerRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/whatif', whatIfRoutes);
app.use('/api/compare', architectureComparisonRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Central error handler (must be last)
app.use(errorHandler);

module.exports = app;
