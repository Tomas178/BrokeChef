import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { usersService } from '@server/services/usersService';
import { userWithPaginationSchema } from '@server/entities/shared';

export default authenticatedProcedure
  .use(provideServices({ usersService }))
  .input(userWithPaginationSchema)
  .query(
    async ({
      input: { userId, offset, limit },
      ctx: { authUser, services },
    }) => {
      userId = userId ?? authUser.id;

      const createdRecipes = await services.usersService.getCreatedRecipes(
        userId,
        {
          offset,
          limit,
        }
      );

      return createdRecipes;
    }
  );
