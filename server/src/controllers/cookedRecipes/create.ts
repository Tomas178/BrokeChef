import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { cookedRecipesService } from '@server/services/cookedRecipesService';
import { integerIdObjectSchema } from '@server/entities/shared';
import CannotMarkOwnRecipeAsCooked from '@server/utils/errors/recipes/CannotMarkOwnRecipeAsCooked';
import { TRPCError } from '@trpc/server';
import type { CookedRecipesLink } from '@server/repositories/cookedRecipesRepository';
import RecipeAlreadyMarkedAsCooked from '@server/utils/errors/recipes/RecipeAlreadyMarkedAsCooked';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import { cookedRecipesSchema } from '@server/entities/cookedRecipes';

export default authenticatedProcedure
  .use(
    provideServices({
      cookedRecipesService,
    })
  )
  .meta({
    openapi: {
      method: 'POST',
      path: '/cookedRecipes/create',
      summary: 'Create the cooked recipe link in the databse',
      tags: ['cookedRecipes'],
      protect: true,
    },
  })
  .input(integerIdObjectSchema)
  .output(cookedRecipesSchema.optional())
  .mutation(
    async ({ input: { id: recipeId }, ctx: { services, authUser } }) => {
      try {
        const cookedRecipeLink: CookedRecipesLink = {
          userId: authUser.id,
          recipeId,
        };

        const markedRecipe =
          await services.cookedRecipesService.create(cookedRecipeLink);

        return markedRecipe;
      } catch (error) {
        if (error instanceof RecipeNotFound) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: error.message,
          });
        }

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

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark recipe as cooked',
          cause: error,
        });
      }
    }
  );
