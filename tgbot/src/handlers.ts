import type { Bot, Context } from 'grammy';
import type { Logger } from 'winston';
import type { HandlerService } from './handlerService.js';

export function registerHandlers(bot: Bot, handlerService: HandlerService, logger: Logger) {
  bot.command(
    'start',
    withCommandLogging('start', logger, async (ctx) => {
      await ctx.reply(await handlerService.getStartMessage());
    })
  );

  bot.command(
    'help',
    withCommandLogging('help', logger, async (ctx) => {
      await ctx.reply(handlerService.getHelpMessage());
    })
  );

  bot.command(
    'about',
    withCommandLogging('about', logger, async (ctx) => {
      await ctx.reply(handlerService.getAboutMessage());
    })
  );

  bot.command(
    'contact',
    withCommandLogging('contact', logger, async (ctx) => {
      await ctx.reply(handlerService.getContactMessage());
    })
  );
}

function withCommandLogging(
  command: string,
  logger: Logger,
  handler: (ctx: Context) => Promise<void>
) {
  return async (ctx: Context) => {
    const metadata = {
      command,
      userId: ctx.from?.id,
      username: ctx.from?.username,
      chatId: ctx.chat?.id,
    };

    logger.info('Telegram command received', metadata);

    try {
      await handler(ctx);
      logger.info('Telegram command completed', metadata);
    } catch (error) {
      logger.error('Telegram command failed', {
        ...metadata,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  };
}