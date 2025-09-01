import { publicProcedure } from '@server/trpc';
import provideRepos from '@server/trpc/provideRepos';
import { recipesRepository } from '@server/repositories/recipesRepository';

export default publicProcedure
  .use(provideRepos({ recipesRepository }))
  .query(async ({ ctx: { repos } }) => {
    const totalCount = await repos.recipesRepository.totalCount();

    return totalCount;
  });
