import winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}] ${message}${metaStr}`;
  })
);

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export function createLogger(level = process.env.LOG_LEVEL || 'info') {
  return winston.createLogger({
    level,
    format: jsonFormat,
    defaultMeta: { service: 'tgbot' },
    transports: [
      new winston.transports.Console({
        format: isProduction ? jsonFormat : consoleFormat,
      }),
    ],
  });
}

export const logger = createLogger();
