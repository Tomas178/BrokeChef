import { TRPCError } from '@trpc/server';
import { recipeAuthorProcedure } from '@server/trpc/recipeAuthorProcedure';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import { S3ServiceException } from '@aws-sdk/client-s3';
import provideServices from '@server/trpc/provideServices';
import { recipesService } from '@server/services/recipesService';

export default recipeAuthorProcedure
  .use(provideServices({ recipesService }))
  .mutation(async ({ input: recipeId, ctx: { services } }) => {
    try {
      await services.recipesService.remove(recipeId);

      return;
    } catch (error) {
      if (error instanceof RecipeNotFound) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recipe was not found',
        });
      }

      if (error instanceof S3ServiceException) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete delete the recipe',
        });
      }
    }
  });
