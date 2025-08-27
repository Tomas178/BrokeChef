import { publicProcedure } from '@server/trpc';
import provideRepos from '@server/trpc/provideRepos';
import { integerIdSchema } from '@server/entities/shared';
import { savedRecipesRepository } from '@server/repositories/savedRecipesRepository';

export default publicProcedure
  .use(provideRepos({ savedRecipesRepository }))
  .input(integerIdSchema)
  .query(async ({ input: recipeId, ctx: { authUser, repos } }) => {
    if (!authUser) return false;

    const isSaved = await repos.savedRecipesRepository.isSaved(
      recipeId,
      authUser.id
    );

    return isSaved;
  });
