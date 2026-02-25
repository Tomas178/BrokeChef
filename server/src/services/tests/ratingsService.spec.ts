import { fakeRating, fakeRecipeAllInfo } from '@server/entities/tests/fakes';
import { ratingsService as buildRatingsService } from '@server/services/ratingsService';
import type { Database } from '@server/database';
import type { RatingsRepository } from '@server/repositories/ratingsRepository';
import { NoResultError } from 'kysely';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import CannotRateOwnRecipe from '@server/utils/errors/recipes/CannotRateOwnRecipe';
import { PostgresError } from 'pg-error-enum';
import type { Mock } from 'vitest';
import type { RecipesRepository } from '@server/repositories/recipesRepository';

const mockValidateRecipeExists = vi.hoisted(() => vi.fn());
const mockValidateRecipeAndUserIsNotAuthor = vi.hoisted(() => vi.fn());
const [fakeSingleRating, fakeAverageRating] = vi.hoisted(() => [5, 3.5]);

vi.mock('@server/services/utils/recipeValidations', () => ({
  validateRecipeExists: mockValidateRecipeExists,
  validateRecipeAndUserIsNotAuthor: mockValidateRecipeAndUserIsNotAuthor,
}));

const mockRatingsRepoGetUserRatingForRecipe: Mock<
  RatingsRepository['getUserRatingForRecipe']
> = vi.fn(async () => fakeSingleRating);

const mockRatingsRepoCreate: Mock<RatingsRepository['create']> = vi.fn(
  async ({ userId, recipeId, rating }) =>
    fakeRating({
      userId,
      recipeId,
      rating,
    })
);

const mockRatingsRepoUpdate: Mock<RatingsRepository['update']> = vi.fn(
  async ({ userId, recipeId, rating }) =>
    fakeRating({
      userId,
      recipeId,
      rating,
    })
);

const mockRatingsRepoRemove: Mock<RatingsRepository['remove']> = vi.fn(
  async (recipeId, userId) =>
    fakeRating({
      userId,
      recipeId,
      rating: fakeAverageRating,
    })
);

const mockRatingsRepository = {
  getUserRatingForRecipe: mockRatingsRepoGetUserRatingForRecipe,
  create: mockRatingsRepoCreate,
  update: mockRatingsRepoUpdate,
  remove: mockRatingsRepoRemove,
} as Partial<RatingsRepository>;

const mockRecipesFindById: Mock<RecipesRepository['findById']> = vi.fn(
  async id => fakeRecipeAllInfo({ id, rating: fakeAverageRating, steps: [] })
);

const mockRecipesRepository = {
  findById: mockRecipesFindById,
} as Partial<RecipesRepository>;

vi.mock('@server/repositories/ratingsRepository', () => ({
  ratingsRepository: () => mockRatingsRepository,
}));

vi.mock('@server/repositories/recipesRepository', () => ({
  recipesRepository: () => mockRecipesRepository,
}));

const mockDatabase = {} as Database;

const ratingsService = buildRatingsService(mockDatabase);

const authorId = 'a'.repeat(32);
const nonAuthorId = authorId + 'a';
const recipeId = 1;

const fakeRecipeToRate = fakeRating({
  userId: nonAuthorId,
  recipeId: recipeId,
  rating: fakeSingleRating,
});

const fakeRecipeToUpdate = fakeRating({
  ...fakeRecipeToRate,
  rating: fakeAverageRating,
});

describe('getUserRatingForRecipe', () => {
  it('Should throw an error when recipe does not exist', async () => {
    mockValidateRecipeExists.mockRejectedValueOnce(new RecipeNotFound());

    await expect(
      ratingsService.getUserRatingForRecipe(recipeId, authorId)
    ).rejects.toThrow(/not found/i);
  });

  it('Should return 0 if no rating was found', async () => {
    const zero = 0;
    mockRatingsRepoGetUserRatingForRecipe.mockResolvedValueOnce(zero);

    await expect(
      ratingsService.getUserRatingForRecipe(recipeId, authorId)
    ).resolves.toBe(zero);
  });

  it('Should return rating when the rating exists', async () => {
    await expect(
      ratingsService.getUserRatingForRecipe(recipeId, authorId)
    ).resolves.toBe(fakeSingleRating);
  });
});

describe('create', () => {
  it('Should throw an error when recipe does not exist', async () => {
    mockValidateRecipeAndUserIsNotAuthor.mockRejectedValueOnce(
      new RecipeNotFound()
    );

    await expect(ratingsService.create(fakeRecipeToRate)).rejects.toThrow(
      /not found/i
    );
  });

  it('Should throw an error when author is trying to rate his own recipe', async () => {
    mockValidateRecipeAndUserIsNotAuthor.mockRejectedValueOnce(
      new CannotRateOwnRecipe()
    );

    await expect(ratingsService.create(fakeRecipeToRate)).rejects.toThrow(
      /own/i
    );
  });

  describe('Postgres errors', () => {
    vi.mock('@server/utils/errors', () => ({
      assertPostgresError: vi.fn(),
    }));

    it('Should throw an error when rating is already present in database', async () => {
      mockRatingsRepoCreate.mockRejectedValueOnce({
        code: PostgresError.UNIQUE_VIOLATION,
      });

      await expect(ratingsService.create(fakeRecipeToRate)).rejects.toThrow(
        /exists|created|already/i
      );
    });

    it('Should rethrow any other Postgres error', async () => {
      mockRatingsRepoCreate.mockRejectedValueOnce({
        code: PostgresError.ACTIVE_SQL_TRANSACTION,
      });

      await expect(ratingsService.create(fakeRecipeToRate)).rejects.toThrow();
    });
  });

  it('Should rate the recipe', async () => {
    const rating = await ratingsService.create(fakeRecipeToRate);

    expect(rating).toBe(fakeAverageRating);
  });

  it('Should return 0 if the recipe cannot be fetched after creation', async () => {
    mockRecipesFindById.mockResolvedValueOnce(undefined);

    const rating = await ratingsService.create(fakeRecipeToRate);

    expect(rating).toBe(0);
  });
});

describe('update', () => {
  it('Should throw an error when recipe does not exist', async () => {
    mockValidateRecipeExists.mockRejectedValueOnce(new RecipeNotFound());

    await expect(ratingsService.update(fakeRecipeToUpdate)).rejects.toThrow(
      /not found/i
    );
  });

  it('Should update the rating', async () => {
    const updatedRating = await ratingsService.update(fakeRecipeToUpdate);

    expect(updatedRating).toBe(fakeRecipeToUpdate.rating);
  });

  it('Should return zero if the recipe cannot be fetched after update', async () => {
    mockRecipesFindById.mockResolvedValueOnce(undefined);

    const updatedRating = await ratingsService.update(fakeRecipeToUpdate);

    expect(updatedRating).toBe(0);
  });
});

describe('remove', async () => {
  const userId = fakeRecipeToRate.userId;
  const recipeId = fakeRecipeToRate.recipeId;

  it('Should throw an error if no result has been returned from database', async () => {
    mockRatingsRepoRemove.mockRejectedValueOnce(new NoResultError({} as any));

    await expect(ratingsService.remove(userId, recipeId)).rejects.toThrow(
      /not found/i
    );
  });

  it('Should rethrow any other error', async () => {
    const errorMessage = 'Something happened';
    mockRatingsRepoRemove.mockRejectedValueOnce(new Error(errorMessage));

    await expect(ratingsService.remove(userId, recipeId)).rejects.toThrow(
      errorMessage
    );
  });

  it('Should remove the rating and return the new average rating', async () => {
    const removedRating = await ratingsService.remove(userId, recipeId);

    expect(removedRating).toBe(fakeAverageRating);
  });

  it('Should remove the rating and return 0 if new recipe rating is undefined', async () => {
    mockRecipesFindById.mockResolvedValueOnce(undefined);

    const removedRating = await ratingsService.remove(userId, recipeId);

    expect(removedRating).toBe(0);
  });
});
