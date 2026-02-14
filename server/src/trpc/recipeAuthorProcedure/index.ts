import { TRPCError } from '@trpc/server';
import { integerIdObjectSchema } from '@server/entities/shared';
import { authenticatedProcedure } from '../authenticatedProcedure';
import provideRepos from '../provideRepos';
import { recipesRepository } from '../../repositories/recipesRepository';

export const recipeAuthorProcedure = authenticatedProcedure
  .use(provideRepos({ recipesRepository }))
  .input(integerIdObjectSchema)
  .use(async ({ input: { id: recipeId }, ctx: { authUser, repos }, next }) => {
    const isAuthor = await repos.recipesRepository.isAuthor(
      recipeId,
      authUser.id
    );

    if (!isAuthor) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Only author can remove the recipe',
      });
    }

    return next();
  });
