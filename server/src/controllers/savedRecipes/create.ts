import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import { integerIdSchema } from '@server/entities/shared';
import { savedRecipesService } from '@server/services/savedRecipesService';
import provideServices from '@server/trpc/provideServices';

export default authenticatedProcedure
  .use(provideServices({ savedRecipesService }))
  .input(integerIdSchema)
  .mutation(async ({ input: recipeId, ctx: { services, authUser } }) => {
    const savedRecipe = services.savedRecipesService.create(
      authUser.id,
      recipeId
    );

    return savedRecipe;
  });
