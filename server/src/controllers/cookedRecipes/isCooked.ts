import provideRepos from '@server/trpc/provideRepos';
import { booleanSchema, integerIdObjectSchema } from '@server/entities/shared';
import {
  cookedRecipesRepository,
  type CookedRecipesLink,
} from '@server/repositories/cookedRecipesRepository';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';

export default authenticatedProcedure
  .use(provideRepos({ cookedRecipesRepository }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/cookedRecipes/isCooked',
      summary: 'Check if the recipe has already been saevd',
      tags: ['cookedRecipes'],
      protect: true,
    },
  })
  .input(integerIdObjectSchema)
  .output(booleanSchema)
  .query(async ({ input: { id: recipeId }, ctx: { authUser, repos } }) => {
    const link: CookedRecipesLink = {
      userId: authUser.id,
      recipeId,
    };

    const isCooked = await repos.cookedRecipesRepository.isCooked(link);

    return isCooked;
  });
