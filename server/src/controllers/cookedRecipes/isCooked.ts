import provideRepos from '@server/trpc/provideRepos';
import { integerIdSchema } from '@server/entities/shared';
import {
  cookedRecipesRepository,
  type CookedRecipesLink,
} from '@server/repositories/cookedRecipesRepository';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';

export default authenticatedProcedure
  .use(provideRepos({ cookedRecipesRepository }))
  .input(integerIdSchema)
  .query(async ({ input: recipeId, ctx: { authUser, repos } }) => {
    const link: CookedRecipesLink = {
      userId: authUser.id,
      recipeId,
    };

    const isCooked = await repos.cookedRecipesRepository.isCooked(link);

    return isCooked;
  });
