import http, { type Server } from 'node:http';
import type { Logger } from 'winston';

export type HealthState = {
  telegramStatus: 'starting' | 'ready' | 'stopped';
};

export function startHealthServer(
  port: number,
  logger: Logger,
  getState: () => HealthState
): Server {
  const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/status') {
      const state = getState();
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(
        JSON.stringify({
          status: state.telegramStatus === 'ready' ? 'Running' : 'Starting',
          service: 'tgbot',
          telegram: state.telegramStatus,
        })
      );
      return;
    }

    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ status: false, error: 'Not found' }));
  });

  server.listen(port, () => {
    logger.info(`Health server listening on port ${port}`);
  });

  return server;
}

export function stopHealthServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}
