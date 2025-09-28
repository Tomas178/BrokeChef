import type { Database } from '@server/database';
import { savedRecipesRepository as buildSavedRecipesRepository } from '@server/repositories/savedRecipesRepository';
import { recipesRepository as buildRecipesRepository } from '@server/repositories/recipesRepository';
import { assertError, assertPostgresError } from '@server/utils/errors';
import RecipeAlreadySaved from '@server/utils/errors/recipes/RecipeAlreadySaved';
import { PostgresError } from 'pg-error-enum';
import CannotSaveOwnRecipe from '@server/utils/errors/recipes/CannotSaveOwnRecipe';
import { NoResultError } from 'kysely';
import SavedRecipeNotFound from '@server/utils/errors/recipes/SavedRecipeNotFound';
import type { savedRecipesPublic } from '@server/entities/savedRecipes';
import {
  validateRecipeAndUserIsNotAuthor,
  validateRecipeExists,
} from './utils/recipeValidations';

interface SavedRecipesService {
  create: (
    userId: string,
    recipeId: number
  ) => Promise<savedRecipesPublic | undefined>;
  remove: (
    recipeId: number,
    userId: string
  ) => Promise<savedRecipesPublic | undefined>;
}

export function savedRecipesService(database: Database): SavedRecipesService {
  const savedRecipesRepository = buildSavedRecipesRepository(database);
  const recipesRepository = buildRecipesRepository(database);

  return {
    async create(userId, recipeId) {
      await validateRecipeAndUserIsNotAuthor(
        recipesRepository,
        recipeId,
        userId,
        CannotSaveOwnRecipe
      );

      try {
        const createdRecipe = await savedRecipesRepository.create({
          userId,
          recipeId,
        });

        return createdRecipe;
      } catch (error) {
        assertPostgresError(error);

        if (error.code === PostgresError.UNIQUE_VIOLATION) {
          throw new RecipeAlreadySaved();
        }
      }
    },

    async remove(recipeId, userId) {
      await validateRecipeExists(recipesRepository, recipeId);

      try {
        const unsavedRecipe = await savedRecipesRepository.remove(
          recipeId,
          userId
        );

        return unsavedRecipe;
      } catch (error) {
        assertError(error);

        if (error instanceof NoResultError) throw new SavedRecipeNotFound();
      }
    },
  };
}
