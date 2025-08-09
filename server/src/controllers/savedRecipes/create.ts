import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideRepos from '@server/trpc/provideRepos';
import { savedRecipesRepository } from '@server/repositories/savedRecipesRepository';
import { integerIdSchema } from '@server/entities/shared';

export default authenticatedProcedure
  .use(provideRepos({ savedRecipesRepository }))
  .input(integerIdSchema)
  .mutation(async ({ input: recipeId, ctx: { repos, authUser } }) => {
    const savedRecipe = repos.savedRecipesRepository.create({
      recipeId,
      userId: authUser.id,
    });

    return savedRecipe;
  });
