import { publicProcedure } from '@server/trpc';
import provideRepos from '@server/trpc/provideRepos';
import { recipesRepository } from '@server/repositories/recipesRepository';
import { userWithPaginationSchema } from '@server/entities/shared';

export default publicProcedure
  .use(provideRepos({ recipesRepository }))
  .input(userWithPaginationSchema)
  .query(async ({ input: { userId, offset, limit }, ctx: { repos } }) => {
    const recipes = await repos.recipesRepository.findSaved(userId, {
      offset,
      limit,
    });

    return recipes;
  });
