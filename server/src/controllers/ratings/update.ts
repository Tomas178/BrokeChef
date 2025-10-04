import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { ratingsService } from '@server/services/ratingsService';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import { TRPCError } from '@trpc/server';
import { createRatingSchema } from './create';

export default authenticatedProcedure
  .use(provideServices({ ratingsService }))
  .input(createRatingSchema)
  .mutation(async ({ input, ctx: { authUser, services } }) => {
    try {
      const ratingForUpdate = {
        ...input,
        userId: authUser.id,
      };

      const updatedRating =
        await services.ratingsService.update(ratingForUpdate);

      return updatedRating;
    } catch (error) {
      if (error instanceof RecipeNotFound) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }
    }
  });
