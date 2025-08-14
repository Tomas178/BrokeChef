import type { Database } from '@server/database';
import { savedRecipesRepository as buildSavedRecipesRepository } from '@server/repositories/savedRecipesRepository';
import { recipesRepository as buildRecipesRepository } from '@server/repositories/recipesRepository';
import { TRPCError } from '@trpc/server';
import { assertError, assertPostgresError } from '@server/utils/errors';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import RecipeAlreadySaved from '@server/utils/errors/recipes/RecipeAlreadySaved';
import { PostgresError } from 'pg-error-enum';
import CannotSaveOwnRecipe from '@server/utils/errors/recipes/CannotSaveOwnRecipe';

export function savedRecipesService(database: Database) {
  const savedRecipesRepository = buildSavedRecipesRepository(database);
  const recipesRepository = buildRecipesRepository(database);

  return {
    async create(userId: string, recipeId: number) {
      const recipeById = await recipesRepository.findById(recipeId);

      if (!recipeById) throw new RecipeNotFound(recipeId);

      if (recipeById.userId === userId) throw new CannotSaveOwnRecipe(recipeId);

      try {
        const createdRecipe = await savedRecipesRepository.create({
          userId,
          recipeId,
        });

        return createdRecipe;
      } catch (error) {
        assertPostgresError(error);

        if (error.code === PostgresError.UNIQUE_VIOLATION) {
          throw new RecipeAlreadySaved(recipeId);
        }
      }
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
