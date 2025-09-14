import { integerIdSchema } from '@server/entities/shared';
import { recipesRepository } from '@server/repositories/recipesRepository';
import provideRepos from '@server/trpc/provideRepos';
import { TRPCError } from '@trpc/server';
import { signImages } from '@server/utils/signImages';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';

export default authenticatedProcedure
  .use(provideRepos({ recipesRepository }))
  .input(integerIdSchema)
  .query(async ({ input: recipeId, ctx: { repos } }) => {
    const recipe = await repos.recipesRepository.findById(recipeId);

    if (!recipe) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Recipe was not found',
      });
    }

    recipe.imageUrl = await signImages(recipe.imageUrl);

    return recipe;
  });
