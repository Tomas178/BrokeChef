import { integerIdSchema } from '@server/entities/shared';
import provideRepos from '@server/trpc/provideRepos';
import { recipesRepository } from '@server/repositories/recipesRepository';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';

export default authenticatedProcedure
  .use(provideRepos({ recipesRepository }))
  .input(integerIdSchema)
  .query(async ({ input: recipeId, ctx: { authUser, repos } }) => {
    const isAuthor = await repos.recipesRepository.isAuthor(
      recipeId,
      authUser.id
    );

    return isAuthor;
  });
