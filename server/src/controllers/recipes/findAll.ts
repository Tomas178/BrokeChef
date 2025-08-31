import { publicProcedure } from '@server/trpc';
import provideRepos from '@server/trpc/provideRepos';
import { recipesRepository } from '@server/repositories/recipesRepository';
import { paginationSchema } from '@server/entities/shared';
import { signRecipeImage } from '@server/utils/signRecipeImages';
import type { RecipesPaginated } from '@server/entities/recipes';

export default publicProcedure
  .use(
    provideRepos({
      recipesRepository,
    })
  )
  .input(paginationSchema)
  .query(
    async ({
      input: { offset, limit },
      ctx: { repos },
    }): Promise<RecipesPaginated> => {
      const allRecipes = await repos.recipesRepository.findAll({
        offset,
        limit: limit + 1,
      });

      const hasMore = allRecipes.length > limit;
      const recipes = allRecipes.slice(0, limit);

      await signRecipeImage(recipes);

      return {
        recipes,
        hasMore,
      };
    }
  );
