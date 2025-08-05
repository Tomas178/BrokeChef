import { publicProcedure } from '@server/trpc';
import provideRepos from '@server/trpc/provideRepos';
import * as z from 'zod';
import { recipesRepository } from '@server/repositories/recipesRepository';

const POSTGRES_INT_MAX = 2141483647;

export default publicProcedure
  .use(
    provideRepos({
      recipesRepository,
    })
  )
  .input(
    z
      .object({
        offset: z.number().int().min(0).max(POSTGRES_INT_MAX),
        limit: z.number().int().min(1).max(100),
      })
      .default({
        offset: 0,
        limit: 5,
      })
  )
  .query(async ({ input, ctx: { repos } }) => {
    const recipes = await repos.recipesRepository.findAll(input);

    return recipes;
  });
