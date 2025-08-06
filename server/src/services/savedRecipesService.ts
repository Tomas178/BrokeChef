import type { Database } from '@server/database';
import { savedRecipesRepository as buildSavedRecipesRepository } from '@server/repositories/savedRecipesRepository';
import { recipesRepository as buildRecipesRepository } from '@server/repositories/recipesRepository';
import { TRPCError } from '@trpc/server';
import { assertError } from '@server/utils/errors';

export function savedRecipesService(database: Database) {
  const savedRecipesRepository = buildSavedRecipesRepository(database);
  const recipesRepository = buildRecipesRepository(database);

  return {
    async create(userId: string, recipeId: number) {
      const recipeById = await recipesRepository.findById(recipeId);

      if (!recipeById)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recipe was not found!',
        });

      if (recipeById.userId === userId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot save your own recipe!',
        });
      }

      const createdRecipe = await savedRecipesRepository.create({
        userId,
        recipeId,
      });

      return createdRecipe;
    },

    async remove(recipeId: number, userId: string) {
      const recipeById = await recipesRepository.findById(recipeId);

      if (!recipeById)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Recipe was not found!',
        });

      if (recipeById.userId === userId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot unsave your own recipe!',
        });
      }

      try {
        const unsavedRecipe = await savedRecipesRepository.remove(
          recipeId,
          userId
        );

        return unsavedRecipe;
      } catch (error) {
        assertError(error);

        if (error.message.includes('no result')) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Failed to unsave!',
          });
        }
      }
    },
  };
}
