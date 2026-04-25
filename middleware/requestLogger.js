const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        const logData = {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            ip: req.ip || req.socket?.remoteAddress,
            userAgent: req.headers['user-agent'],
        };

        if (req.user) {
            logData.userId = req.user.userId;
        }

        const level = res.statusCode >= 500 ? 'error'
            : res.statusCode >= 400 ? 'warn'
            : 'info';

        logger[level]('HTTP Request', logData);
    });

    next();
};

module.exports = requestLogger;
