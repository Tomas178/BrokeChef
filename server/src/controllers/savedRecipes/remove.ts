import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import { integerIdSchema } from '@server/entities/shared';
import { savedRecipesService } from '@server/services/savedRecipesService';
import provideServices from '@server/trpc/provideServices';
import { TRPCError } from '@trpc/server';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import SavedRecipeNotFound from '@server/utils/errors/recipes/SavedRecipeNotFound';
import type { SavedRecipesLink } from '@server/repositories/savedRecipesRepository';

export default authenticatedProcedure
  .use(provideServices({ savedRecipesService }))
  .input(integerIdSchema)
  .mutation(async ({ input: recipeId, ctx: { authUser, services } }) => {
    try {
      const unsaveRecipeLink: SavedRecipesLink = {
        userId: authUser.id,
        recipeId,
      };

      const unsavedRecipe =
        await services.savedRecipesService.remove(unsaveRecipeLink);

      return unsavedRecipe;
    } catch (error) {
      if (error instanceof RecipeNotFound) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }

      if (error instanceof SavedRecipeNotFound) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: error.message,
        });
      }
    }
  });
