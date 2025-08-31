import type { Database } from '@server/database';
import type { RecipesPublic } from '@server/entities/recipes';
import { recipesRepository as buildRecipesRepository } from '@server/repositories/recipesRepository';
import type { Pagination } from '@server/shared/pagination';
import { signRecipeImage } from '@server/utils/signRecipeImages';

interface UsersService {
  getRecipes: (
    id: string,
    pagination: Pagination
  ) => Promise<{
    created: RecipesPublic[];
    saved: RecipesPublic[];
  }>;
}

export function usersService(database: Database): UsersService {
  const recipesRepository = buildRecipesRepository(database);

  return {
    async getRecipes(id, pagination) {
      const [created, saved] = await Promise.all([
        recipesRepository.findCreated(id, pagination),
        recipesRepository.findSaved(id, pagination),
      ]);

      await Promise.all([signRecipeImage(created), signRecipeImage(saved)]);

      return { created, saved };
    },
  };
}
