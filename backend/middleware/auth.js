// Auth middleware - JWT verification
// Extracts userId from verified JWT, not request body

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable required');
}

function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }
  
  const token = authHeader.substring(7); // Remove "Bearer "
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId || decoded.sub; // Extract from verified token
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

// Optional auth for public endpoints (extracts userId if present, allows anonymous)
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.userId = null; // Anonymous
    return next();
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId || decoded.sub;
  } catch (err) {
    req.userId = null; // Invalid token = treat as anonymous
  }
  
  next();
}

module.exports = { verifyAuth, optionalAuth };
