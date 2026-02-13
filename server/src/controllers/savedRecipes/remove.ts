import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import { integerIdObjectSchema } from '@server/entities/shared';
import { savedRecipesService } from '@server/services/savedRecipesService';
import provideServices from '@server/trpc/provideServices';
import type { SavedRecipesLink } from '@server/repositories/savedRecipesRepository';
import { savedRecipesSchema } from '@server/entities/savedRecipes';
import { withServiceErrors } from '@server/utils/errors/utils/withServiceErrors';

export default authenticatedProcedure
  .use(provideServices({ savedRecipesService }))
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/savedRecipes/remove',
      summary: 'Remove saved recipe record from database',
      tags: ['savedRecipes'],
      protect: true,
    },
  })
  .input(integerIdObjectSchema)
  .output(savedRecipesSchema.optional())
  .mutation(async ({ input: { id: recipeId }, ctx: { authUser, services } }) =>
    withServiceErrors(async () => {
      const unsaveRecipeLink: SavedRecipesLink = {
        userId: authUser.id,
        recipeId,
      };

      const unsavedRecipe =
        await services.savedRecipesService.remove(unsaveRecipeLink);

      return unsavedRecipe;
    })
  );
