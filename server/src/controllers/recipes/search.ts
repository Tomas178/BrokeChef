import { publicProcedure } from '@server/trpc';
import provideServices from '@server/trpc/provideServices';
import { recipesService } from '@server/services/recipesService';
import { paginationWithUserInput } from '@server/entities/shared';
import {
  checkRateLimit,
  type RateLimitConfig,
} from '@server/utils/rateLimiter';
import { recipesPublicArrayOutputSchema } from '@server/controllers/outputSchemas/recipesSchemas';
import { withServiceErrors } from '@server/utils/errors/utils/withServiceErrors';

export const NO_IP_ADDRESS = 'unknown-ip';

const EMBEDDED_SEARCH_RATE_LIMIT_PER_USER = 10;
const EMBEDDED_SEARCH_WINDOW_SECONDS = 3600;

const rateLimitConfig: RateLimitConfig = {
  endpoint: 'embedded-search',
  rateLimit: EMBEDDED_SEARCH_RATE_LIMIT_PER_USER,
  windowSeconds: EMBEDDED_SEARCH_WINDOW_SECONDS,
};

export default publicProcedure
  .use(provideServices({ recipesService }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/recipes/search',
      summary: 'Search recipes semantically',
      tags: ['Recipes'],
    },
  })
  .input(paginationWithUserInput)
  .output(recipesPublicArrayOutputSchema)
  .query(async ({ input: paginationWithUserInput, ctx: { services, req } }) =>
    withServiceErrors(async () => {
      const ipAddress = req?.ip || NO_IP_ADDRESS;

      await checkRateLimit(ipAddress, rateLimitConfig);

      const { userInput, ...pagination } = paginationWithUserInput;

      const recipes = await services.recipesService.search(
        userInput,
        pagination
      );

      return recipes;
    })
  );
