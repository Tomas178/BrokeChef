import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import { integerIdSchema } from '@server/entities/shared';
import { savedRecipesService } from '@server/services/savedRecipesService';
import provideServices from '@server/trpc/provideServices';
import RecipeAlreadySaved from '@server/utils/errors/recipes/RecipeAlreadySaved';
import { TRPCError } from '@trpc/server';
import CannotSaveOwnRecipe from '@server/utils/errors/recipes/CannotSaveOwnRecipe';
import type { SavedRecipesLink } from '@server/repositories/savedRecipesRepository';

export default authenticatedProcedure
  .use(provideServices({ savedRecipesService }))
  .input(integerIdSchema)
  .mutation(async ({ input: recipeId, ctx: { services, authUser } }) => {
    try {
      const saveRecipeLink: SavedRecipesLink = {
        userId: authUser.id,
        recipeId,
      };

      const savedRecipe =
        await services.savedRecipesService.create(saveRecipeLink);

      return savedRecipe;
    } catch (error) {
      if (error instanceof CannotSaveOwnRecipe) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: error.message,
        });
      }

      if (error instanceof RecipeAlreadySaved) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: error.message,
        });
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        cause: error,
      });
    }
  });
