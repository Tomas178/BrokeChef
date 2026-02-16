import Redis from 'ioredis';
import config from '@server/config';
import { GracefulShutdownPriority } from '@server/enums/GracefulShutdownPriority';
import { gracefulShutdownManager } from '../GracefulShutdownManager';

export const redis = new Redis(config.redis.port, config.redis.host, {
  maxRetriesPerRequest: undefined,
});

/* v8 ignore start */
gracefulShutdownManager.registerCleanup(
  'redis',
  async () => {
    await redis.quit();
  },
  GracefulShutdownPriority.INFRASTRUCTURE
);
/* v8 ignore stop */
