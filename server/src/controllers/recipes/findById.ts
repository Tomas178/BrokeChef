import { integerIdObjectSchema } from '@server/entities/shared';
import { TRPCError } from '@trpc/server';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { recipesService } from '@server/services/recipesService';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import { recipesPublicAllInfoOutputSchema } from '@server/entities/outputSchemas';

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
  .query(async ({ input: { id: recipeId }, ctx: { services } }) => {
    try {
      const recipe = await services.recipesService.findById(recipeId);

      return recipe;
    } catch (error) {
      if (error instanceof RecipeNotFound) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recipe was not found',
        });
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        cause: error,
      });
    }
  });
