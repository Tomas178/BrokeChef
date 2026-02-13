import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { usersService } from '@server/services/usersService';
import { userWithPaginationSchema } from '@server/entities/shared';
import { recipesPublicArrayOutputSchema } from '../outputSchemas/recipesSchemas';

export default authenticatedProcedure
  .use(provideServices({ usersService }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/users/getCreatedRecipes',
      summary: 'Get created recipes by the user',
      tags: ['Users'],
      protect: true,
    },
  })
  .input(userWithPaginationSchema)
  .output(recipesPublicArrayOutputSchema)
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
