import config from '@server/config';
import type { ConnectionOptions } from 'bullmq';

export const redisConnection: ConnectionOptions = {
  host: config.redis.host,
  port: config.redis.port,
};
