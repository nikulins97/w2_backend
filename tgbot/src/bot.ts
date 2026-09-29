import { Bot } from 'grammy';
import type { Logger } from 'winston';
import type { ApiClient } from './clients/apiClient.js';
import type { BusinessClient } from './clients/businessClient.js';
import { registerHandlers } from './handlers.js';
import { HandlerService } from './handlerService.js';

type BotDeps = {
  apiClient: ApiClient;
  businessClient: BusinessClient;
  logger: Logger;
};

export function createBot(token: string, deps: BotDeps): Bot {
  const bot = new Bot(token);

  registerHandlers(bot, new HandlerService(deps), deps.logger);

  bot.catch((error) => {
    deps.logger.error('Telegram handler failed', {
      error: error.error,
      update: error.ctx.update.update_id,
    });
  });

  return bot;
}
