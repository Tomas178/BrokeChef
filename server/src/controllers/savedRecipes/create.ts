import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import { integerIdObjectSchema } from '@server/entities/shared';
import { savedRecipesService } from '@server/services/savedRecipesService';
import provideServices from '@server/trpc/provideServices';
import RecipeAlreadySaved from '@server/utils/errors/recipes/RecipeAlreadySaved';
import { TRPCError } from '@trpc/server';
import CannotSaveOwnRecipe from '@server/utils/errors/recipes/CannotSaveOwnRecipe';
import type { SavedRecipesLink } from '@server/repositories/savedRecipesRepository';
import { savedRecipesSchema } from '@server/entities/savedRecipes';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';

export default authenticatedProcedure
  .use(provideServices({ savedRecipesService }))
  .meta({
    openapi: {
      method: 'POST',
      path: '/savedRecipes/create',
      summary: 'Create a saved recipe record in database',
      tags: ['savedRecipes'],
      protect: true,
    },
  })
  .input(integerIdObjectSchema)
  .output(savedRecipesSchema.optional())
  .mutation(
    async ({ input: { id: recipeId }, ctx: { services, authUser } }) => {
      try {
        const saveRecipeLink: SavedRecipesLink = {
          userId: authUser.id,
          recipeId,
        };

        const savedRecipe =
          await services.savedRecipesService.create(saveRecipeLink);

        return savedRecipe;
      } catch (error) {
        if (error instanceof RecipeNotFound) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: error.message,
          });
        }

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
    }
  );
