import createApp from './app';
import config from './config';
import { createDatabase } from './database';
import logger from './logger';

process.on('uncaughtException', error => {
  logger.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', reason => {
  logger.error('Unhandled Error:', reason);
});

import '@server/workers/email';
import '@server/workers/recipe';
import { gracefulShutdownManager } from './utils/GracefulShutdownManager';
import { GracefulShutdownPriority } from './enums/GracefulShutdownPriority';

const database = createDatabase(config.database);

gracefulShutdownManager.registerCleanup(
  'database',
  async () => {
    await database.destroy();
  },
  GracefulShutdownPriority.DATABASE
);

const app = createApp(database);

const server = app.listen(config.port, '0.0.0.0', () => {
  logger.info(`Server is running at port: ${config.port}`);
});

gracefulShutdownManager.attachServer(server);

const SHUTDOWN_SIGNALS = ['SIGTERM', 'SIGINT'];

for (const signal of SHUTDOWN_SIGNALS) {
  process.on(signal, async () => gracefulShutdownManager.shutdown(signal));
}
