import { paginationSchema } from '@server/entities/shared';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { recipesService } from '@server/services/recipesService';
import { recipesPublicArrayOutputSchema } from '@server/entities/outputSchemas';

export default authenticatedProcedure
  .use(provideServices({ recipesService }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/recipes/findAllRecommended',
      summary: 'Fetch all recommended recipes',
      tags: ['Recipes'],
      protect: true,
    },
  })
  .input(paginationSchema)
  .output(recipesPublicArrayOutputSchema)
  .query(async ({ input: pagination, ctx: { authUser, services } }) => {
    const recipes = await services.recipesService.findAllRecommended(
      authUser.id,
      pagination
    );

    return recipes;
  });
