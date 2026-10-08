// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // path relative to project root

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_here';

module.exports = async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || req.headers.Authorization;
    if (!header) return res.status(401).json({ error: 'Authorization header missing' });

    const parts = header.split(' ');
    const token = parts.length === 2 && parts[0].toLowerCase() === 'bearer' ? parts[1] : null;
    if (!token) return res.status(401).json({ error: 'Bearer token missing' });

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // attach minimal user info to req.user (avoid DB lookup on every request unless needed)
    req.user = { id: payload.id, role: payload.role };

    // Optionally, you can load the full user document if you need it:
    // const user = await User.findById(payload.id).lean();
    // if (!user) return res.status(401).json({ error: 'User not found' });
    // req.userDoc = user;

    next();
  } catch (err) {
    console.error('authMiddleware error', err);
    res.status(500).json({ error: 'Authentication error' });
  }
};
