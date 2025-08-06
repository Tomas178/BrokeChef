import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideRepos from '@server/trpc/provideRepos';
import { savedRecipesRepository } from '@server/repositories/savedRecipesRepository';
import { savedRecipesSchema } from '@server/entities/savedRecipes';

export default authenticatedProcedure
  .use(provideRepos({ savedRecipesRepository }))
  .input(savedRecipesSchema.omit({ createdAt: true }))
  .mutation(async ({ input, ctx: { repos } }) => {
    const savedRecipe = repos.savedRecipesRepository.create(input);

    return savedRecipe;
  });
