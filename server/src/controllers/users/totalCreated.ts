import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideRepos from '@server/trpc/provideRepos';
import { recipesRepository } from '@server/repositories/recipesRepository';
import { oauthUserIdSchema } from '@server/entities/shared';

export default authenticatedProcedure
  .use(provideRepos({ recipesRepository }))
  .input(oauthUserIdSchema.nullish())
  .query(async ({ input: userId, ctx: { authUser, repos } }) => {
    userId = userId ?? authUser.id;

    const createdRecipes =
      await repos.recipesRepository.totalCreatedByUser(userId);

    return createdRecipes;
  });
