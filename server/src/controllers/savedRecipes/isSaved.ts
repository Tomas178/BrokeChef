import provideRepos from '@server/trpc/provideRepos';
import { integerIdSchema } from '@server/entities/shared';
import { savedRecipesRepository } from '@server/repositories/savedRecipesRepository';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';

export default authenticatedProcedure
  .use(provideRepos({ savedRecipesRepository }))
  .input(integerIdSchema)
  .query(async ({ input: recipeId, ctx: { authUser, repos } }) => {
    const isSaved = await repos.savedRecipesRepository.isSaved(
      recipeId,
      authUser.id
    );

    return isSaved;
  });
