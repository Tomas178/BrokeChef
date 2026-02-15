import provideRepos from '@server/trpc/provideRepos';
import { booleanSchema, integerIdObjectSchema } from '@server/entities/shared';
import {
  savedRecipesRepository,
  type SavedRecipesLink,
} from '@server/repositories/savedRecipesRepository';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';

export default authenticatedProcedure
  .use(provideRepos({ savedRecipesRepository }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/savedRecipes/{id}',
      summary: 'Check if the use has the recipe saved',
      tags: ['savedRecipes'],
      protect: true,
    },
  })
  .input(integerIdObjectSchema)
  .output(booleanSchema)
  .query(async ({ input: { id: recipeId }, ctx: { authUser, repos } }) => {
    const link: SavedRecipesLink = {
      userId: authUser.id,
      recipeId,
    };

    const isSaved = await repos.savedRecipesRepository.isSaved(link);

    return isSaved;
  });
