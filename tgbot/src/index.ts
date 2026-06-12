import { createBot } from './bot.js';
import { ApiClient } from './clients/apiClient.js';
import { BusinessClient } from './clients/businessClient.js';
import { loadEnv } from './config/env.js';
import { startHealthServer, stopHealthServer } from './health/server.js';
import { createLogger } from './logger.js';

async function main() {
  const env = loadEnv();
  const logger = createLogger(env.logLevel);

  const apiClient = new ApiClient(env.apiBaseUrl);
  const businessClient = new BusinessClient(env.businessBaseUrl);

  const bot = createBot(env.botToken, {
    apiClient,
    businessClient,
    logger,
  });

  let telegramStatus: 'starting' | 'ready' | 'stopped' = 'starting';
  const healthServer = startHealthServer(env.healthPort, logger, () => ({
    telegramStatus,
  }));

  const shutdown = async (signal: NodeJS.Signals) => {
    logger.info(`Received ${signal}, shutting down`);
    telegramStatus = 'stopped';
    bot.stop();
    await stopHealthServer(healthServer);
  };

  process.once('SIGINT', () => {
    void shutdown('SIGINT');
  });
  process.once('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  logger.info('Starting Telegram bot');
  await bot.start({
    onStart: (botInfo: { username?: string }) => {
      telegramStatus = 'ready';
      logger.info('Telegram bot started', { username: botInfo.username });
    },
  });
}

main().catch((error) => {
  const logger = createLogger();
  logger.error('Fatal tgbot error', { error });
  process.exit(1);
});
