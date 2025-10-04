import type { Database } from '@server/database';
import type { RatingsPublic, Rating } from '@server/entities/ratings';
import { ratingsRepository as buildRatingsRepository } from '@server/repositories/ratingsRepository';
import { recipesRepository as buildRecipesRepository } from '@server/repositories/recipesRepository';
import { assertPostgresError } from '@server/utils/errors';
import CannotRateOwnRecipe from '@server/utils/errors/recipes/CannotRateOwnRecipe';
import RatingNotFound from '@server/utils/errors/recipes/RatingNotFound';
import RecipeAlreadyRated from '@server/utils/errors/recipes/RecipeAlreadyRated';
import { NoResultError } from 'kysely';
import { PostgresError } from 'pg-error-enum';
import {
  validateRecipeAndUserIsNotAuthor,
  validateRecipeExists,
} from './utils/recipeValidations';

export interface RatingInput {
  userId: string;
  recipeId: number;
  rating: number;
}

interface RatingsService {
  getUserRatingForRecipe: (recipeId: number, userId: string) => Promise<Rating>;
  create: (recipeToRate: RatingInput) => Promise<RatingsPublic | undefined>;
  update: (recipeToUpdate: RatingInput) => Promise<RatingsPublic | undefined>;
  remove: (
    userId: string,
    recipeId: number
  ) => Promise<RatingsPublic | undefined>;
}

export function ratingsService(database: Database): RatingsService {
  const ratingsRepository = buildRatingsRepository(database);
  const recipesRepository = buildRecipesRepository(database);

  return {
    async getUserRatingForRecipe(recipeId, userId) {
      await validateRecipeExists(recipesRepository, recipeId);

      const rating = await ratingsRepository.getUserRatingForRecipe(
        recipeId,
        userId
      );

      return rating;
    },

    async create(recipeToRate) {
      await validateRecipeAndUserIsNotAuthor(
        recipesRepository,
        recipeToRate.recipeId,
        recipeToRate.userId,
        CannotRateOwnRecipe
      );

      try {
        const ratedRecipe = await ratingsRepository.create(recipeToRate);

        return ratedRecipe;
      } catch (error) {
        assertPostgresError(error);

        if (error.code == PostgresError.UNIQUE_VIOLATION) {
          throw new RecipeAlreadyRated();
        }
      }
    },

    async update(recipeToUpdate) {
      await validateRecipeExists(recipesRepository, recipeToUpdate.recipeId);

      const updatedRating = await ratingsRepository.update(recipeToUpdate);

      return updatedRating;
    },

    async remove(userId, recipeId) {
      try {
        const removedRating = await ratingsRepository.remove(recipeId, userId);

        return removedRating;
      } catch (error) {
        if (error instanceof NoResultError) throw new RatingNotFound();
      }
    },
  };
}
