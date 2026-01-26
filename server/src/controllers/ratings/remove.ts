import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { ratingsService } from '@server/services/ratingsService';
import { integerIdSchema } from '@server/entities/shared';
import RatingNotFound from '@server/utils/errors/recipes/RatingNotFound';
import { TRPCError } from '@trpc/server';

export default authenticatedProcedure
  .use(provideServices({ ratingsService }))
  .input(integerIdSchema)
  .mutation(async ({ input: recipeId, ctx: { authUser, services } }) => {
    try {
      const ratingAfterRemoval = await services.ratingsService.remove(
        authUser.id,
        recipeId
      );

      return ratingAfterRemoval;
    } catch (error) {
      if (error instanceof RatingNotFound) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        cause: error,
      });
    }
  });
