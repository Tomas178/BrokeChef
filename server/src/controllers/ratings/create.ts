import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { ratingsService } from '@server/services/ratingsService';
import { ratingsSchema } from '@server/entities/ratings';
import RecipeAlreadyRated from '@server/utils/errors/recipes/RecipeAlreadyRated';
import { TRPCError } from '@trpc/server';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import CannotRateOwnRecipe from '@server/utils/errors/recipes/CannotRateOwnRecipe';
import * as z from 'zod';

export const createRatingSchema = ratingsSchema.pick({
  recipeId: true,
  rating: true,
});

export type CreateRatingInput = z.infer<typeof createRatingSchema>;

export default authenticatedProcedure
  .use(provideServices({ ratingsService }))
  .input(createRatingSchema)
  .mutation(async ({ input, ctx: { authUser, services } }) => {
    try {
      const createRatingInput = {
        ...input,
        userId: authUser.id,
      };

      const rating = await services.ratingsService.create(createRatingInput);

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

      if (error instanceof CannotRateOwnRecipe) {
        throw new TRPCError({
          code: 'FORBIDDEN',
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
