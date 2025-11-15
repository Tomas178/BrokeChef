import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { cookedRecipesService } from '@server/services/cookedRecipesService';
import { integerIdSchema } from '@server/entities/shared';
import { TRPCError } from '@trpc/server';
import CookedRecipeNotFound from '@server/utils/errors/recipes/CookedRecipeNotFound';
import type { CookedRecipesLink } from '@server/repositories/cookedRecipesRepository';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';

export default authenticatedProcedure
  .use(provideServices({ cookedRecipesService }))
  .input(integerIdSchema)
  .mutation(async ({ input: recipeId, ctx: { authUser, services } }) => {
    try {
      const unmarkCookedRecipeLink: CookedRecipesLink = {
        userId: authUser.id,
        recipeId,
      };

      const unmarkedRecipe = await services.cookedRecipesService.remove(
        unmarkCookedRecipeLink
      );

      return unmarkedRecipe;
    } catch (error) {
      if (error instanceof RecipeNotFound) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: error.message,
        });
      }

      if (error instanceof CookedRecipeNotFound) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }

      throw new Error('Failed to unmark cooked recipe');
    }
  });
