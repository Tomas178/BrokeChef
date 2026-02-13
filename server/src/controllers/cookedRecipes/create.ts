import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { cookedRecipesService } from '@server/services/cookedRecipesService';
import { integerIdObjectSchema } from '@server/entities/shared';
import type { CookedRecipesLink } from '@server/repositories/cookedRecipesRepository';
import { cookedRecipesSchema } from '@server/entities/cookedRecipes';
import { withServiceErrors } from '@server/utils/errors/utils/withServiceErrors';

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
  .mutation(async ({ input: { id: recipeId }, ctx: { services, authUser } }) =>
    withServiceErrors(async () => {
      const cookedRecipeLink: CookedRecipesLink = {
        userId: authUser.id,
        recipeId,
      };

      const markedRecipe =
        await services.cookedRecipesService.create(cookedRecipeLink);

      return markedRecipe;
    })
  );
