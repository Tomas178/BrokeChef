import { publicProcedure } from '@server/trpc';
import provideRepos from '@server/trpc/provideRepos';
import { recipesRepository } from '@server/repositories/recipesRepository';
import { paginationSchema } from '@server/entities/shared';
import { signImages } from '@server/utils/signImages';

export default publicProcedure
  .use(
    provideRepos({
      recipesRepository,
    })
  )
  .input(paginationSchema)
  .query(async ({ input: { offset, limit }, ctx: { repos } }) => {
    const recipes = await repos.recipesRepository.findAll({
      offset,
      limit,
    });

    const imageUrls = recipes.map(recipe => recipe.imageUrl);
    const signedUrls = await signImages(imageUrls);

    for (const [index, recipe] of recipes.entries()) {
      recipe.imageUrl = signedUrls[index];
    }

    return recipes;
  });
