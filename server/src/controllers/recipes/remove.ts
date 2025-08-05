import { integerIdSchema } from '@server/entities/shared';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideRepos from '@server/trpc/provideRepos';
import { recipesRepository } from '@server/repositories/recipesRepository';
import { TRPCError } from '@trpc/server';
import { assertError } from '@server/utils/errors';

export default authenticatedProcedure
  .use(provideRepos({ recipesRepository }))
  .input(integerIdSchema)
  .query(async ({ input: recipeId, ctx: { repos } }) => {
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
  });
