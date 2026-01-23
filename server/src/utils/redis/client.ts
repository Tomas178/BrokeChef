import Redis from 'ioredis';
import config from '@server/config';

export const redis = new Redis(config.redis.port, config.redis.host, {
  maxRetriesPerRequest: undefined,
});
