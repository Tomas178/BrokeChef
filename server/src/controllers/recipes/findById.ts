import { integerIdSchema } from '@server/entities/shared';
import { recipesRepository } from '@server/repositories/recipesRepository';
import { publicProcedure } from '@server/trpc';
import provideRepos from '@server/trpc/provideRepos';
import { TRPCError } from '@trpc/server';
import { s3Client } from '@server/utils/AWSS3Client/client';
import { signUrl } from '@server/utils/AWSS3Client/signUrl';

export default publicProcedure
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

    recipe.imageUrl = await signUrl(s3Client, recipe.imageUrl);

    return recipe;
  });
