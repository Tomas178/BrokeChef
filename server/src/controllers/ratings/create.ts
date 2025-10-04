import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { ratingsService } from '@server/services/ratingsService';
import { ratingsSchema } from '@server/entities/ratings';
import RecipeAlreadyRated from '@server/utils/errors/recipes/RecipeAlreadyRated';
import { TRPCError } from '@trpc/server';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';

const createRatingSchema = ratingsSchema.pick({
  recipeId: true,
  userId: true,
  rating: true,
});

export default authenticatedProcedure
  .use(provideServices({ ratingsService }))
  .input(createRatingSchema)
  .mutation(async ({ input, ctx: { services } }) => {
    try {
      const rating = await services.ratingsService.create(input);

      return rating;
    } catch (error) {
      if (error instanceof RecipeNotFound) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }

      if (error instanceof RecipeAlreadyRated) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: error.message,
        });
      }
    }
  });
