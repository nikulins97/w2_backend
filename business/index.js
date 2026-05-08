require('dotenv').config();
const express = require('express');
const prisma = require('./db');
const logger = require('./utils/logger');
const requestLogger = require('./middleware/requestLogger');

const app = express();

app.use(express.json({ limit: '32kb' }));
app.use(requestLogger);

const PORT = process.env.PORT || 4000;

const adRoutes = require('./ads/routes');

app.get('/status', (req, res) => {
  res.json({ status: 'Running', service: 'business' });
});

app.use('/ads', adRoutes);

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected');

    if (!process.env.INTERNAL_SERVICE_TOKEN) {
      logger.warn('INTERNAL_SERVICE_TOKEN is not set — internal routes will fail');
    }

    app.listen(PORT, () => {
      logger.info(`Business service listening on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Launch error', { error: error.message });
    process.exit(1);
  }
};

process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Database disconnected');
});

startServer();
