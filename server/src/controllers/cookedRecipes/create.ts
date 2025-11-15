import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { cookedRecipesService } from '@server/services/cookedRecipesService';
import { integerIdSchema } from '@server/entities/shared';
import CannotMarkOwnRecipeAsCooked from '@server/utils/errors/recipes/CannotMarkOwnRecipeAsCooked';
import { TRPCError } from '@trpc/server';
import type { CookedRecipesLink } from '@server/repositories/cookedRecipesRepository';
import RecipeAlreadyMarkedAsCooked from '@server/utils/errors/recipes/RecipeAlreadyMarkedAsCooked';

export default authenticatedProcedure
  .use(
    provideServices({
      cookedRecipesService,
    })
  )
  .input(integerIdSchema)
  .mutation(async ({ input: recipeId, ctx: { services, authUser } }) => {
    try {
      const cookedRecipeLink: CookedRecipesLink = {
        userId: authUser.id,
        recipeId,
      };

      const markedRecipe =
        await services.cookedRecipesService.create(cookedRecipeLink);

      return markedRecipe;
    } catch (error) {
      if (error instanceof CannotMarkOwnRecipeAsCooked) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: error.message,
        });
      }

      if (error instanceof RecipeAlreadyMarkedAsCooked) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: error.message,
        });
      }

      throw new Error('Failed to mark recipe as cooked');
    }
  });
