import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import { integerIdSchema } from '@server/entities/shared';
import { savedRecipesService } from '@server/services/savedRecipesService';
import provideServices from '@server/trpc/provideServices';
import RecipeAlreadySaved from '@server/utils/errors/recipes/RecipeAlreadySaved';
import { TRPCError } from '@trpc/server';

export default authenticatedProcedure
  .use(provideServices({ savedRecipesService }))
  .input(integerIdSchema)
  .mutation(async ({ input: recipeId, ctx: { services, authUser } }) => {
    try {
      const savedRecipe = await services.savedRecipesService.create(
        authUser.id,
        recipeId
      );

      return savedRecipe;
    } catch (error) {
      if (error instanceof RecipeAlreadySaved) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: error.message,
        });
      }
    }
  });
