import { publicProcedure } from '@server/trpc';
import provideServices from '@server/trpc/provideServices';
import { recipesService } from '@server/services/recipesService';
import { paginationSchema } from '@server/entities/shared';

export default publicProcedure
  .use(
    provideServices({
      recipesService,
    })
  )
  .input(paginationSchema)
  .query(async ({ input: { offset, limit }, ctx: { services } }) => {
    const recipes = await services.recipesService.findAll({
      offset,
      limit,
    });

    return recipes;
  });
