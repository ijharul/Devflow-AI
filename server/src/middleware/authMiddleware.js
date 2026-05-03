const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Guard against tokens that are technically valid JWTs but are missing
    // the fields our application requires.
    if (!decoded.id || !decoded.email) {
      return res.status(401).json({ success: false, message: 'Not authorized, malformed token' });
    }

    // jwt.verify already rejects expired tokens; surface a clear message for
    // the remaining cases (invalid signature, wrong algorithm, etc.).
    req.user = decoded; // { id, email, name }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Not authorized, token has expired' });
    }
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
  }
};

module.exports = { protect };
