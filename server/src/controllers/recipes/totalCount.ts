import { publicProcedure } from '@server/trpc';
import provideRepos from '@server/trpc/provideRepos';
import { recipesRepository } from '@server/repositories/recipesRepository';
import { integerIdSchema } from '@server/entities/shared';

export default publicProcedure
  .use(provideRepos({ recipesRepository }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/recipes/totalCount',
      summary: 'Get total count of recipes',
      tags: ['Recipes'],
    },
  })
  .output(integerIdSchema)
  .query(async ({ ctx: { repos } }) => {
    const totalCount = await repos.recipesRepository.totalCount();

    return totalCount;
  });
