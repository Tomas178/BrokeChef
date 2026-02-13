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
      method: 'POST',
      path: '/savedRecipes/create',
      summary: 'Create a saved recipe record in database',
      tags: ['savedRecipes'],
      protect: true,
    },
  })
  .input(integerIdObjectSchema)
  .output(savedRecipesSchema.optional())
  .mutation(async ({ input: { id: recipeId }, ctx: { services, authUser } }) =>
    withServiceErrors(async () => {
      const saveRecipeLink: SavedRecipesLink = {
        userId: authUser.id,
        recipeId,
      };

      const savedRecipe =
        await services.savedRecipesService.create(saveRecipeLink);

      return savedRecipe;
    })
  );
