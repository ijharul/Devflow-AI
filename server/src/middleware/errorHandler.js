const errorHandler = (err, req, res, _next) => {
  // ── express-validator errors array ────────────────────────────────────────
  // express-validator does not throw — controllers call next(err) manually, or
  // a downstream middleware may pass a synthetic error object with an errors
  // array attached.
  if (Array.isArray(err.errors) && err.errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({ field: e.path || e.param, message: e.msg })),
    });
  }

  // ── Mongoose duplicate-key error (e.g. unique email index) ───────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const friendlyMessage =
      field === 'email'
        ? 'An account with this email already exists'
        : `A record with this ${field} already exists`;
    return res.status(409).json({ success: false, message: friendlyMessage });
  }

  // ── Mongoose schema validation error ─────────────────────────────────────
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: messages,
    });
  }

  // ── Mongoose bad ObjectId ─────────────────────────────────────────────────
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid resource ID format' });
  }

  // ── JWT errors ────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token has expired' });
  }

  // ── Generic fallback ──────────────────────────────────────────────────────
  const statusCode = err.statusCode || 500;

  // Don't leak internals in production
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : err.message || 'Something went wrong';

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[error] ${req.method} ${req.originalUrl} →`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
