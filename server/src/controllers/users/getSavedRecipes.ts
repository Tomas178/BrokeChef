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

      const savedRecipes = await services.usersService.getSavedRecipes(userId, {
        offset,
        limit,
      });

      return savedRecipes;
    }
  );
