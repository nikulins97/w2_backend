const logger = require('../utils/logger');

function internalAuth(req, res, next) {
  const expected = process.env.INTERNAL_SERVICE_TOKEN;
  if (!expected) {
    logger.error('INTERNAL_SERVICE_TOKEN is not set');
    return res.status(500).json({ status: false, error: 'Service misconfigured' });
  }

  const token = req.headers['x-internal-token'];
  if (token !== expected) {
    logger.warn('Internal auth failed', { correlationId: req.correlationId });
    return res.status(401).json({ status: false, error: 'Unauthorized' });
  }

  next();
}

module.exports = internalAuth;
