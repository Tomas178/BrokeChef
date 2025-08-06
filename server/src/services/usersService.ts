import type { Database } from '@server/database';
import { recipesRepository as buildRecipesRepository } from '@server/repositories/recipesRepository';
import type { Pagination } from '@server/shared/types';
import { usersRepository as buildUsersRepository } from '../repositories/usersRepository';
import { TRPCError } from '@trpc/server';

export function usersService(database: Database) {
  const usersRepository = buildUsersRepository(database);
  const recipesRepository = buildRecipesRepository(database);

  return {
    async findById(id: string) {
      const user = await usersRepository.findById(id);

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User was not found!',
        });
      }

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
