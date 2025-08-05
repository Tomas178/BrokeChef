import { publicProcedure } from '@server/trpc';
import provideRepos from '@server/trpc/provideRepos';
import { recipesRepository } from '../../repositories/recipesRepository';
import { oauthUserIdSchema, paginationSchema } from '@server/entities/shared';
import * as z from 'zod';

const userWithPaginationSchema = z.object({
  userId: oauthUserIdSchema,
  offset: paginationSchema.shape.offset.default(0),
  limit: paginationSchema.shape.limit.default(5),
});

export default publicProcedure
  .use(provideRepos({ recipesRepository }))
  .input(userWithPaginationSchema)
  .query(async ({ input: { userId, offset, limit }, ctx: { repos } }) => {
    const recipes = await repos.recipesRepository.findByUser(userId, {
      offset,
      limit,
    });

    return recipes;
  });
