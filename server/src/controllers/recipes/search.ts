import { publicProcedure } from '@server/trpc';
import provideServices from '@server/trpc/provideServices';
import { recipesService } from '@server/services/recipesService';
import { paginationWithUserInput } from '@server/entities/shared';
import {
  checkRateLimit,
  type RateLimitConfig,
} from '@server/utils/rateLimiter';
import RateLimitError from '@server/utils/errors/general/RateLimitError';
import { TRPCError } from '@trpc/server';

export const NO_IP_ADDRESS = 'unknown-ip';

const EMBEDDED_SEARCH_RATE_LIMIT_PER_USER = 3;
const EMBEDDED_SEARCH_WINDOW_SECONDS = 3600;

const rateLimitConfig: RateLimitConfig = {
  endpoint: 'embedded-search',
  rateLimit: EMBEDDED_SEARCH_RATE_LIMIT_PER_USER,
  windowSeconds: EMBEDDED_SEARCH_WINDOW_SECONDS,
};

export default publicProcedure
  .use(provideServices({ recipesService }))
  .input(paginationWithUserInput)
  .query(async ({ input: paginationWithUserInput, ctx: { services, req } }) => {
    const ipAddress = req?.ip || NO_IP_ADDRESS;

    try {
      await checkRateLimit(ipAddress, rateLimitConfig);
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: error.message,
        });
      }

      throw error;
    }

    const { userInput, ...pagination } = paginationWithUserInput;

    const recipes = await services.recipesService.search(userInput, pagination);

    return recipes;
  });
