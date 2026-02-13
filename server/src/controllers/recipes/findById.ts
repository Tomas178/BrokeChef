import { integerIdObjectSchema } from '@server/entities/shared';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { recipesService } from '@server/services/recipesService';
import { recipesPublicAllInfoOutputSchema } from '@server/controllers/outputSchemas/recipesSchemas';
import { withServiceErrors } from '@server/utils/errors/utils/withServiceErrors';

export default authenticatedProcedure
  .use(provideServices({ recipesService }))
  .meta({
    openapi: {
      method: 'GET',
      path: '/recipes/{id}',
      summary: 'Get recipe by given ID',
      tags: ['Recipes'],
      protect: true,
    },
  })
  .input(integerIdObjectSchema)
  .output(recipesPublicAllInfoOutputSchema)
  .query(async ({ input: { id: recipeId }, ctx: { services } }) =>
    withServiceErrors(async () => {
      const recipe = await services.recipesService.findById(recipeId);

      return recipe;
    })
  );
