// tgbot/src/handlerService.ts
import type { Logger } from 'winston';
import type { ApiClient } from './clients/apiClient.js';
import type { BusinessClient } from './clients/businessClient.js';

export class HandlerService {
  constructor(
    private readonly deps: {
      apiClient: ApiClient;
      businessClient: BusinessClient;
      logger: Logger;
    }
  ) {}

  async getStartMessage(): Promise<string> {
    try {
      const [apiStatus, businessStatus] = await Promise.all([
        this.deps.apiClient.getStatus(),
        this.deps.businessClient.getStatus(),
      ]);

      return [
        'Tgbot is running.',
        `API: ${apiStatus}`,
        `Business: ${businessStatus}`,
      ].join('\n');
    } catch (error) {
      this.deps.logger.warn('Tgbot status check failed', {
        error: error instanceof Error ? error.message : error,
      });

      return 'Tgbot is running, but service status check failed.';
    }
  };

  getHelpMessage(): string {
    return ['/start - статус сервисов', '/help - список команд', '/about - о боте', '/contact - контакты'].join('\n');
  };

  getAboutMessage(): string {
    return 'Этот телеграм-бот поможет вам рассчитать стоимость автомобиля на заказ';
  };

  getContactMessage(): string {
    return 'По всем вопросам пишите этому боту';
  };
}