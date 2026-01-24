import { paginationSchema } from '@server/entities/shared';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { recipesService } from '@server/services/recipesService';

export default authenticatedProcedure
  .use(provideServices({ recipesService }))
  .input(paginationSchema)
  .query(async ({ input: pagination, ctx: { authUser, services } }) => {
    const recipes = await services.recipesService.findAllRecommended(
      authUser.id,
      pagination
    );

    return recipes;
  });
