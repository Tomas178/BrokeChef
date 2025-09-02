import provideServices from '@server/trpc/provideServices';
import { usersService } from '@server/services/usersService';
import { userWithPaginationSchema } from '@server/entities/shared';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';

export default authenticatedProcedure
  .use(provideServices({ usersService }))
  .input(userWithPaginationSchema)
  .query(
    async ({
      input: { userId, offset, limit },
      ctx: { authUser, services },
    }) => {
      const result = await (userId
        ? services.usersService.getRecipes(userId, {
            offset,
            limit,
          })
        : services.usersService.getRecipes(authUser.id, {
            offset,
            limit,
          }));

      return result;
    }
  );
