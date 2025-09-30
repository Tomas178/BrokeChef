import { integerIdSchema } from '@server/entities/shared';
import { TRPCError } from '@trpc/server';
import { signImages } from '@server/utils/signImages';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideServices from '@server/trpc/provideServices';
import { recipesService } from '@server/services/recipesService';

export default authenticatedProcedure
  .use(provideServices({ recipesService }))
  .input(integerIdSchema)
  .query(async ({ input: recipeId, ctx: { services } }) => {
    const recipe = await services.recipesService.findById(recipeId);

    if (!recipe) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Recipe was not found',
      });
    }

    recipe.imageUrl = await signImages(recipe.imageUrl);

    return recipe;
  });
