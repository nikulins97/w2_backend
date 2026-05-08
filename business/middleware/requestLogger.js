const { randomUUID } = require('crypto');
const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  const correlationId =
    req.headers['x-request-id'] ||
    req.headers['x-correlation-id'] ||
    randomUUID();
  req.correlationId = correlationId;
  res.setHeader('X-Request-Id', correlationId);

  const startTime = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const logData = {
      correlationId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip || req.socket?.remoteAddress,
    };

    const level =
      res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    logger[level]('HTTP Request', logData);
  });

  next();
}

module.exports = requestLogger;
