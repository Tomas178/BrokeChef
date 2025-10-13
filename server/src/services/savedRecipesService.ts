import type { Database } from '@server/database';
import {
  savedRecipesRepository as buildSavedRecipesRepository,
  type SavedRecipesLink,
} from '@server/repositories/savedRecipesRepository';
import { recipesRepository as buildRecipesRepository } from '@server/repositories/recipesRepository';
import { assertError, assertPostgresError } from '@server/utils/errors';
import RecipeAlreadySaved from '@server/utils/errors/recipes/RecipeAlreadySaved';
import { PostgresError } from 'pg-error-enum';
import CannotSaveOwnRecipe from '@server/utils/errors/recipes/CannotSaveOwnRecipe';
import { NoResultError } from 'kysely';
import SavedRecipeNotFound from '@server/utils/errors/recipes/SavedRecipeNotFound';
import type { savedRecipesPublic } from '@server/entities/savedRecipes';
import logger from '@server/logger';
import {
  validateRecipeAndUserIsNotAuthor,
  validateRecipeExists,
} from './utils/recipeValidations';

export interface SavedRecipesService {
  create: (link: SavedRecipesLink) => Promise<savedRecipesPublic | undefined>;
  remove: (link: SavedRecipesLink) => Promise<savedRecipesPublic | undefined>;
}

export function savedRecipesService(database: Database): SavedRecipesService {
  const savedRecipesRepository = buildSavedRecipesRepository(database);
  const recipesRepository = buildRecipesRepository(database);

  return {
    async create(link) {
      await validateRecipeAndUserIsNotAuthor(
        recipesRepository,
        link.recipeId,
        link.userId,
        CannotSaveOwnRecipe
      );

      try {
        const createdRecipe = await savedRecipesRepository.create(link);

        logger.info(`user: ${link.userId} saved recipe: ${link.recipeId}`);
        return createdRecipe;
      } catch (error) {
        assertPostgresError(error);

        if (error.code === PostgresError.UNIQUE_VIOLATION) {
          throw new RecipeAlreadySaved();
        }
      }
    },

    async remove(link) {
      await validateRecipeExists(recipesRepository, link.recipeId);

      try {
        const unsavedRecipe = await savedRecipesRepository.remove(link);

        logger.info(`user: ${link.userId} unsaved recipe: ${link.recipeId}`);
        return unsavedRecipe;
      } catch (error) {
        assertError(error);

        if (error instanceof NoResultError) throw new SavedRecipeNotFound();
      }
    },
  };
}
