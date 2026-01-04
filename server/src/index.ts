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

const database = createDatabase(config.database);
const app = createApp(database);

app.listen(config.port, () => {
  logger.info(`Server is running at http://localhost:${config.port}`);
});
