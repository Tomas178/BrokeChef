import { TRPCError } from '@trpc/server';
import { recipeAuthorProcedure } from '@server/trpc/recipeAuthorProcedure';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';

export default recipeAuthorProcedure.mutation(
  async ({ input: recipeId, ctx: { repos } }) => {
    try {
      const recipe = await repos.recipesRepository.remove(recipeId);

      return recipe;
    } catch (error) {
      if (error instanceof RecipeNotFound) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recipe was not found',
        });
      }
    }
  }
);
