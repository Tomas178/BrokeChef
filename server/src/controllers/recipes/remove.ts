import { integerIdSchema } from '@server/entities/shared';
import provideRepos from '@server/trpc/provideRepos';
import { recipesRepository } from '@server/repositories/recipesRepository';
import { TRPCError } from '@trpc/server';
import { assertError } from '@server/utils/errors';
import { recipeAuthorProcedure } from '@server/trpc/recipeAuthorProcedure';
import * as z from 'zod';

export default recipeAuthorProcedure
  .use(provideRepos({ recipesRepository }))
  .input(
    z.object({
      id: integerIdSchema,
    })
  )
  .query(async ({ input: { id }, ctx: { repos } }) => {
    try {
      const recipe = await repos.recipesRepository.remove(id);

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
