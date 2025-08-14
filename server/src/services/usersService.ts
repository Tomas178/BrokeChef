import type { Database } from '@server/database';
import { recipesRepository as buildRecipesRepository } from '@server/repositories/recipesRepository';
import type { Pagination } from '@server/shared/pagination';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import { usersRepository as buildUsersRepository } from '../repositories/usersRepository';

export function usersService(database: Database) {
  const usersRepository = buildUsersRepository(database);
  const recipesRepository = buildRecipesRepository(database);

  return {
    async findById(id: string) {
      const user = await usersRepository.findById(id);

      if (!user) throw new UserNotFound(id);

      return user;
    },

    async getRecipes(id: string, pagination: Pagination) {
      const [created, saved] = await Promise.all([
        recipesRepository.findCreated(id, pagination),
        recipesRepository.findSaved(id, pagination),
      ]);

      return { created, saved };
    },
  };
}
