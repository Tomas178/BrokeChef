import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { cookedRecipesService } from '@server/services/cookedRecipesService';
import { integerIdObjectSchema } from '@server/entities/shared';
import type { CookedRecipesLink } from '@server/repositories/cookedRecipesRepository';
import { cookedRecipesSchema } from '@server/entities/cookedRecipes';
import { withServiceErrors } from '@server/utils/errors/utils/withServiceErrors';

export default authenticatedProcedure
  .use(provideServices({ cookedRecipesService }))
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/cookedRecipes/remove',
      summary: 'Remove cooked recipe link from database',
      tags: ['cookedRecipes'],
      protect: true,
    },
  })
  .input(integerIdObjectSchema)
  .output(cookedRecipesSchema.optional())
  .mutation(async ({ input: { id: recipeId }, ctx: { authUser, services } }) =>
    withServiceErrors(async () => {
      const unmarkCookedRecipeLink: CookedRecipesLink = {
        userId: authUser.id,
        recipeId,
      };

      const unmarkedRecipe = await services.cookedRecipesService.remove(
        unmarkCookedRecipeLink
      );

      return unmarkedRecipe;
    })
  );
