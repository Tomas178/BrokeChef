import * as z from 'zod';
import { TRPCError } from '@trpc/server';
import { integerIdSchema } from '@server/entities/shared';
import { authenticatedProcedure } from '../authenticatedProcedure';
import provideRepos from '../provideRepos';
import { recipesRepository } from '../../repositories/recipesRepository';

export const recipeAuthorProcedure = authenticatedProcedure
  .use(provideRepos({ recipesRepository }))
  .input(
    z.object({
      id: integerIdSchema,
    })
  )
  .use(async ({ input: { id }, ctx: { authUser, repos }, next }) => {
    const isAuthor = await repos.recipesRepository.isAuthor(id, authUser.id);

    if (!isAuthor) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Recipe does not belong to the user',
      });
    }

    return next();
  });
