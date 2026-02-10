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

const database = createDatabase(config.database);
const app = createApp(database);

app.listen(config.port, '0.0.0.0', () => {
  logger.info(`Server is running at port: ${config.port}`);
});
