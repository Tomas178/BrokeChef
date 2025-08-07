import { publicProcedure } from '@server/trpc';
import provideServices from '@server/trpc/provideServices';
import { usersService } from '@server/services/usersService';
import { userWithPaginationSchema } from '@server/entities/shared';

export default publicProcedure
  .use(provideServices({ usersService }))
  .input(userWithPaginationSchema)
  .query(async ({ input: { userId, offset, limit }, ctx: { services } }) => {
    const result = await services.usersService.getRecipes(userId, {
      offset,
      limit,
    });

    return result;
  });
