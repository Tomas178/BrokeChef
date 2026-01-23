import RateLimitError from '@server/utils/errors/general/RateLimitError';
import { redis } from '@server/utils/redis/client';
import logger from '@server/logger';
import { formatRateLimitKey } from './formatRateLimitKey';

export interface RateLimitConfig {
  endpoint: string;
  rateLimit: number;
  windowSeconds: number;
}

export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
) {
  const { endpoint, rateLimit, windowSeconds } = config;

  const key = formatRateLimitKey(identifier, endpoint);

  const currentCount = await redis.incr(key);

  if (currentCount === 1) {
    await redis.expire(key, windowSeconds);
  }

  if (currentCount > rateLimit) {
    const ttl = await redis.ttl(key);

    logger.error(`${identifier} has reached its rate limit!`);
    throw new RateLimitError(
      `You have reached the limit of ${rateLimit} requests. Please wait ${Math.ceil(ttl / 60)} minutes.`
    );
  }
}
