import type { Database } from '@server/database';
import { recipesRepository as buildRecipesRepository } from '@server/repositories/recipesRepository';
import type { Pagination } from '@server/shared/types';

export function usersService(database: Database) {
  const recipesRepository = buildRecipesRepository(database);

  return {
    async getUsersRecipes(userId: string, pagination: Pagination) {
      const [created, saved] = await Promise.all([
        recipesRepository.findCreated(userId, pagination),
        recipesRepository.findSaved(userId, pagination),
      ]);

      return { created, saved };
    },
  };
}
