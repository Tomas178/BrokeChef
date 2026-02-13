import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideRepos from '@server/trpc/provideRepos';
import { recipesRepository } from '@server/repositories/recipesRepository';
import {
  nonNegativeIntegerSchema,
  oauthUserIdObjectNullishSchema,
} from '@server/entities/shared';

export default authenticatedProcedure
  .use(provideRepos({ recipesRepository }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/users/totalCreated',
      summary: 'Get total count of created recipes by the user',
      tags: ['Users'],
      protect: true,
    },
  })
  .input(oauthUserIdObjectNullishSchema)
  .output(nonNegativeIntegerSchema)
  .query(async ({ input, ctx: { authUser, repos } }) => {
    const userId = input?.userId ?? authUser.id;

    const createdRecipes =
      await repos.recipesRepository.totalCreatedByUser(userId);

    return createdRecipes;
  });
