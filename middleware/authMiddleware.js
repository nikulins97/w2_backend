const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.warn('Auth failed: token not provided', { url: req.originalUrl, ip: req.ip });
      return res.status(401).json({
        status: false,
        error: 'Token not provided',
      });
    }

    // format: "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
      logger.warn('Auth failed: invalid token format', { url: req.originalUrl, ip: req.ip });
      return res.status(401).json({
        status: false,
        error: 'Invalid token format',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    req.user = {
      userId: decoded.userId,
      login: decoded.login,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('Auth failed: token expired', { url: req.originalUrl, ip: req.ip });
      return res.status(401).json({
        status: false,
        error: 'Token expired',
      });
    }

    logger.warn('Auth failed: invalid token', { url: req.originalUrl, ip: req.ip, error: error.message });
    return res.status(401).json({
      status: false,
      error: 'Invalid token',
    });
  }
};

module.exports = authMiddleware;
