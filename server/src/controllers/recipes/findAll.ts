import { publicProcedure } from '@server/trpc';
import provideRepos from '@server/trpc/provideRepos';
import { recipesRepository } from '@server/repositories/recipesRepository';
import { paginationSchema } from '@server/entities/shared';

export default publicProcedure
  .use(
    provideRepos({
      recipesRepository,
    })
  )
  .input(paginationSchema)
  .query(async ({ input, ctx: { repos } }) => {
    const recipes = await repos.recipesRepository.findAll(input);

    return recipes;
  });
