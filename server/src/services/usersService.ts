import type { Database } from '@server/database';
import type { RecipesPublic } from '@server/entities/recipes';
import { recipesRepository as buildRecipesRepository } from '@server/repositories/recipesRepository';
import type { Pagination } from '@server/shared/pagination';
import { signImages } from '@server/utils/signImages';

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

      const createdUrls = created.map(recipe => recipe.imageUrl);
      const savedUrls = saved.map(recipe => recipe.imageUrl);

      const [signedCreatedUrls, signedSavedUrls] = await Promise.all([
        signImages(createdUrls),
        signImages(savedUrls),
      ]);

      for (const [index, recipe] of created.entries()) {
        recipe.imageUrl = signedCreatedUrls[index];
      }

      for (const [index, recipe] of saved.entries()) {
        recipe.imageUrl = signedSavedUrls[index];
      }

      return { created, saved };
    },
  };
}
