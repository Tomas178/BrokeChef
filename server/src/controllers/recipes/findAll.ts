import { publicProcedure } from '@server/trpc';
import provideServices from '@server/trpc/provideServices';
import { recipesService } from '@server/services/recipesService';
import { paginationWithSortSchema } from '@server/entities/shared';

export default publicProcedure
  .use(
    provideServices({
      recipesService,
    })
  )
  .input(paginationWithSortSchema)
  .query(async ({ input: paginationWithSort, ctx: { services } }) => {
    const recipes = await services.recipesService.findAll(paginationWithSort);

    return recipes;
  });
