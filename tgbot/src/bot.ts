import { Bot } from 'grammy';
import type { Logger } from 'winston';
import type { ApiClient } from './clients/apiClient.js';
import type { BusinessClient } from './clients/businessClient.js';

type BotDeps = {
  apiClient: ApiClient;
  businessClient: BusinessClient;
  logger: Logger;
};

export function createBot(token: string, deps: BotDeps): Bot {
  const bot = new Bot(token);

  bot.command('start', async (ctx) => {
    try {
      const [apiStatus, businessStatus] = await Promise.all([
        deps.apiClient.getStatus(),
        deps.businessClient.getStatus(),
      ]);

      await ctx.reply(
        [
          'Tgbot is running.',
          `API: ${apiStatus}`,
          `Business: ${businessStatus}`,
        ].join('\n')
      );
    } catch (error) {
      deps.logger.warn('Tgbot status check failed', {
        error: error instanceof Error ? error.message : error,
      });
      await ctx.reply('Tgbot is running, but service status check failed.');
    }
  });

  bot.catch((error) => {
    deps.logger.error('Telegram handler failed', {
      error: error.error,
      update: error.ctx.update.update_id,
    });
  });

  return bot;
}
