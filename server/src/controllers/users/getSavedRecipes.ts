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
      path: '/users/getSavedRecipes',
      summary: 'Get saved recipes by the user',
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

      const savedRecipes = await services.usersService.getSavedRecipes(userId, {
        offset,
        limit,
      });

      return savedRecipes;
    }
  );
