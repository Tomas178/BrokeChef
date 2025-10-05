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

  it('Should return undefined if no rating was found', async () => {
    mockRatingsRepoGetUserRatingForRecipe.mockResolvedValueOnce(undefined);

    await expect(
      ratingsService.getUserRatingForRecipe(recipeId, authorId)
    ).resolves.toBeUndefined();
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

  it('Should throw an error when rating is already present in database', async () => {
    vi.mock('@server/utils/errors', () => ({
      assertPostgresError: vi.fn(),
    }));

    mockRatingsRepoCreate.mockRejectedValueOnce({
      code: PostgresError.UNIQUE_VIOLATION,
    });

    await expect(ratingsService.create(fakeRecipeToRate)).rejects.toThrow(
      /exists|created|already/i
    );
  });

  it('Should rate the recipe', async () => {
    const ratedRecipe = await ratingsService.create(fakeRecipeToRate);

    expect(ratedRecipe).toEqual({
      ...fakeRecipeToRate,
      rating: fakeAverageRating,
      createdAt: expect.any(Date),
    });
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
    console.log(updatedRating);

    expect(updatedRating).toBe(fakeRecipeToUpdate.rating);
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

  it('Should remove the rating', async () => {
    const removedRating = await ratingsService.remove(userId, recipeId);

    expect(removedRating).toMatchObject({
      userId,
      recipeId,
    });
  });
});
