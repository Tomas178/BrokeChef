import { TRPCError } from '@trpc/server';
import { assertError } from '@server/utils/errors';
import { recipeAuthorProcedure } from '@server/trpc/recipeAuthorProcedure';

export default recipeAuthorProcedure.mutation(
  async ({ input: recipeId, ctx: { repos } }) => {
    try {
      const recipe = await repos.recipesRepository.remove(recipeId);

      return recipe;
    } catch (error) {
      assertError(error);

      if (error.message.includes('no result')) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recipe was not found',
        });
      }
    }
  }
);
