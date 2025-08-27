import { integerIdSchema } from '@server/entities/shared';
import { publicProcedure } from '@server/trpc';
import provideRepos from '@server/trpc/provideRepos';
import { recipesRepository } from '@server/repositories/recipesRepository';

export default publicProcedure
  .use(provideRepos({ recipesRepository }))
  .input(integerIdSchema)
  .query(async ({ input: recipeId, ctx: { authUser, repos } }) => {
    if (!authUser) return false;

    const isAuthor = await repos.recipesRepository.isAuthor(
      recipeId,
      authUser.id
    );

    return isAuthor;
  });
