const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  try {
    // get token from header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        status: false,
        error: 'Token not provided',
      });
    }

    // format: "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        status: false,
        error: 'Invalid token format',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Add user data into req
    req.user = {
      userId: decoded.userId,
      login: decoded.login,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: false,
        error: 'Token expired',
      });
    }

    return res.status(401).json({
      status: false,
      error: 'Invalid token',
    });
  }
};

module.exports = authMiddleware;

