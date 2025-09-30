import { integerIdSchema } from '@server/entities/shared';
import { TRPCError } from '@trpc/server';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { recipesService } from '@server/services/recipesService';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';

export default authenticatedProcedure
  .use(provideServices({ recipesService }))
  .input(integerIdSchema)
  .query(async ({ input: recipeId, ctx: { services } }) => {
    try {
      const recipe = await services.recipesService.findById(recipeId);

      return recipe;
    } catch (error) {
      if (error instanceof RecipeNotFound)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recipe was not found',
        });
    }
  });
