import { publicProcedure } from '@server/trpc';
import provideServices from '@server/trpc/provideServices';
import { recipesService } from '@server/services/recipesService';
import { paginationWithSortSchema } from '@server/entities/shared';
import { recipesPublicArrayOutputSchema } from '@server/entities/outputSchemas';

export default publicProcedure
  .use(
    provideServices({
      recipesService,
    })
  )
  .meta({
    openapi: {
      method: 'GET',
      path: '/recipes/all',
      summary: 'Fetch all recipes',
      tags: ['Recipes'],
    },
  })
  .input(paginationWithSortSchema)
  .output(recipesPublicArrayOutputSchema)
  .query(async ({ input: paginationWithSort, ctx: { services } }) => {
    const recipes = await services.recipesService.findAll(paginationWithSort);

    return recipes;
  });
