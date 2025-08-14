import type { Database } from '@server/database';
import { recipesRepository as buildRecipesRepository } from '@server/repositories/recipesRepository';
import type { Pagination } from '@server/shared/pagination';

export function usersService(database: Database) {
  const recipesRepository = buildRecipesRepository(database);

  return {
    async getRecipes(id: string, pagination: Pagination) {
      const [created, saved] = await Promise.all([
        recipesRepository.findCreated(id, pagination),
        recipesRepository.findSaved(id, pagination),
      ]);

      return { created, saved };
    },
  };
}
