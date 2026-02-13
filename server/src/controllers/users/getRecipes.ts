import provideServices from '@server/trpc/provideServices';
import { usersService } from '@server/services/usersService';
import { userWithPaginationSchema } from '@server/entities/shared';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import { allRecipesOutputSchema } from '../outputSchemas/usersSchemas';

export default authenticatedProcedure
  .use(provideServices({ usersService }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/users/getRecipes',
      summary: 'Get all created and saved recipes by the user',
      tags: ['Users'],
      protect: true,
    },
  })
  .input(userWithPaginationSchema)
  .output(allRecipesOutputSchema)
  .query(
    async ({
      input: { userId, offset, limit },
      ctx: { authUser, services },
    }) => {
      userId = userId ?? authUser.id;

      const result = await services.usersService.getRecipes(userId, {
        offset,
        limit,
      });

      return result;
    }
  );
