import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { ratingsService } from '@server/services/ratingsService';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import { TRPCError } from '@trpc/server';
import { integerIdSchema } from '@server/entities/shared';

export default authenticatedProcedure
  .use(provideServices({ ratingsService }))
  .input(integerIdSchema)
  .query(async ({ input: recipeId, ctx: { authUser, services } }) => {
    try {
      const rating = await services.ratingsService.getUserRatingForRecipe(
        recipeId,
        authUser.id
      );

      return rating;
    } catch (error) {
      if (error instanceof RecipeNotFound) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }
    }
  });
