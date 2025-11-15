import type { Database } from '@server/database';
import type { cookedRecipesPublic } from '@server/entities/cookedRecipes';
import type { CookedRecipesLink } from '@server/repositories/cookedRecipesRepository';
import { assertError, assertPostgresError } from '@server/utils/errors';
import { PostgresError } from 'pg-error-enum';
import RecipeAlreadyCooked from '@server/utils/errors/recipes/RecipeAlreadyCooked';
import logger from '@server/logger';
import { recipesRepository as buildRecipesRepository } from '@server/repositories/recipesRepository';
import CannotMarkOwnRecipeAsCooked from '@server/utils/errors/recipes/CannotMarkOwnRecipeAsCooked';
import { NoResultError } from 'kysely';
import CookedRecipeNotFound from '@server/utils/errors/recipes/CookedRecipeNotFound';
import { cookedRecipesRepository as buildCookedRecipesRepository } from '../repositories/cookedRecipesRepository';
import {
  validateRecipeAndUserIsNotAuthor,
  validateRecipeExists,
} from './utils/recipeValidations';

export interface CookedRecipesService {
  create: (link: CookedRecipesLink) => Promise<cookedRecipesPublic | undefined>;
  remove: (link: CookedRecipesLink) => Promise<cookedRecipesPublic | undefined>;
}

export function cookedRecipesService(database: Database): CookedRecipesService {
  const cookedRecipesRepository = buildCookedRecipesRepository(database);
  const recipesRepository = buildRecipesRepository(database);

  return {
    async create(link) {
      await validateRecipeAndUserIsNotAuthor(
        recipesRepository,
        link.recipeId,
        link.userId,
        CannotMarkOwnRecipeAsCooked
      );

      try {
        const createdLink = await cookedRecipesRepository.create(link);

        logger.info(
          `user: ${link.userId} marked recipe with ID: ${link.recipeId} as cooked`
        );
        return createdLink;
      } catch (error) {
        assertPostgresError(error);

        if (error.code === PostgresError.UNIQUE_VIOLATION) {
          throw new RecipeAlreadyCooked();
        }
      }
    },

    async remove(link) {
      await validateRecipeExists(recipesRepository, link.recipeId);

      try {
        const removedLink = await cookedRecipesRepository.remove(link);

        logger.info(
          `user: ${removedLink.userId} unmarked recipe: ${removedLink.recipeId} as cooked`
        );
        return removedLink;
      } catch (error) {
        assertError(error);

        if (error instanceof NoResultError) throw new CookedRecipeNotFound();
      }
    },
  };
}
