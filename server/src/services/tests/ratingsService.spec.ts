import { fakeRating } from '@server/entities/tests/fakes';
import { ratingsService as buildRatingsService } from '@server/services/ratingsService';
import type { Database, Ratings } from '@server/database';
import type { RatingsRepository } from '@server/repositories/ratingsRepository';
import { NoResultError, type Insertable } from 'kysely';
import type { RecipesRepository } from '@server/repositories/recipesRepository';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import CannotRateOwnRecipe from '@server/utils/errors/recipes/CannotRateOwnRecipe';
import { PostgresError } from 'pg-error-enum';
import type { RatingFromDB } from '@server/entities/shared';
import type { Mock } from 'vitest';
import type { RatingsPublic } from '../../entities/ratings';

const mockValidateRecipeExists = vi.hoisted(() => vi.fn());
const mockValidateRecipeAndUserIsNotAuthor = vi.hoisted(() => vi.fn());
const [fakeSingleRating, fakeAverageRating] = vi.hoisted(() => [5, 4.5]);

vi.mock('@server/services/utils/recipeValidations', () => ({
  validateRecipeExists: mockValidateRecipeExists,
  validateRecipeAndUserIsNotAuthor: mockValidateRecipeAndUserIsNotAuthor,
}));

const mockRatingsRepoGetUserRatingForRecipe = vi.fn(
  async (_recipeId: number, _userId: string): Promise<RatingFromDB> =>
    fakeSingleRating
) as Mock<RatingsRepository['getUserRatingForRecipe']>;

const mockRatingsRepoGetRecipeRating = vi.fn(
  async (_recipeId: number): Promise<RatingFromDB> => fakeAverageRating
) as Mock<RatingsRepository['getRecipeRating']>;

const mockRatingsRepoGetRecipeRatingsBatch = vi.fn(
  async (recipeIds: number[]): Promise<RatingFromDB[]> =>
    recipeIds.map(() => fakeAverageRating)
) as Mock<RatingsRepository['getRecipeRatingsBatch']>;

const mockRatingsRepoCreate = vi.fn(
  async ({
    userId,
    recipeId,
    rating,
  }: Insertable<Ratings>): Promise<RatingsPublic> =>
    fakeRating({
      userId,
      recipeId,
      rating,
    })
) as Mock<RatingsRepository['create']>;

const mockRatingsRepoUpdate = vi.fn(
  async ({
    userId,
    recipeId,
    rating,
  }: Insertable<Ratings>): Promise<RatingsPublic> =>
    fakeRating({
      userId,
      recipeId,
      rating,
    })
) as Mock<RatingsRepository['update']>;

const mockRatingsRepoRemove = vi.fn(
  async (recipeId: number, userId: string): Promise<RatingsPublic> =>
    fakeRating({
      userId,
      recipeId,
    })
) as Mock<RatingsRepository['remove']>;

const mockRatingsRepository = {
  getUserRatingForRecipe: mockRatingsRepoGetUserRatingForRecipe,
  getRecipeRating: mockRatingsRepoGetRecipeRating,
  getRecipeRatingsBatch: mockRatingsRepoGetRecipeRatingsBatch,
  create: mockRatingsRepoCreate,
  update: mockRatingsRepoUpdate,
  remove: mockRatingsRepoRemove,
} as RatingsRepository;

const mockRecipesRepository = {} as RecipesRepository;

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
  rating: 5,
});

const fakeRecipeToUpdate = fakeRating({
  ...fakeRecipeToRate,
  rating: 3,
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

describe('getRecipeRating', async () => {
  it('Should throw an error when recipe does not exist', async () => {
    mockValidateRecipeExists.mockRejectedValueOnce(new RecipeNotFound());

    await expect(ratingsService.getRecipeRating(recipeId)).rejects.toThrow(
      /not found/i
    );
  });

  it('Should return undefined if no ratings were found for the given recipe', async () => {
    mockRatingsRepoGetRecipeRating.mockResolvedValueOnce(undefined);

    await expect(
      ratingsService.getRecipeRating(recipeId)
    ).resolves.toBeUndefined();
  });

  it('Should return an average rating for the given recipe when ratings are present', async () => {
    await expect(ratingsService.getRecipeRating(recipeId)).resolves.toBe(
      fakeAverageRating
    );
  });
});

describe('getRecipeRatingsBatch', () => {
  const arrayLength = 4;
  const recipeIds = Array.from(
    { length: arrayLength },
    (_, index) => index + 1
  );

  it('Should throw an error when recipe does not exist', async () => {
    mockValidateRecipeExists.mockRejectedValueOnce(new RecipeNotFound());

    await expect(
      ratingsService.getRecipeRatingsBatch(recipeIds)
    ).rejects.toThrow(/not found/i);
  });

  it('Should return an array full of undefined values because all recipes havo no ratings', async () => {
    const mockBatchResponse = Array.from<number | undefined>({
      length: arrayLength,
    }).fill(undefined);

    mockRatingsRepoGetRecipeRatingsBatch.mockResolvedValueOnce(
      mockBatchResponse
    );

    const ratings = await ratingsService.getRecipeRatingsBatch(recipeIds);

    expect(ratings).toBe(mockBatchResponse);
  });

  it('Should return an array of average ratings with one undefined value because recipe has no ratings', async () => {
    const mockBatchResponse = [
      fakeAverageRating,
      fakeAverageRating,
      undefined,
      fakeAverageRating,
    ];

    mockRatingsRepoGetRecipeRatingsBatch.mockResolvedValueOnce(
      mockBatchResponse
    );

    const ratings = await ratingsService.getRecipeRatingsBatch(recipeIds);

    expect(ratings).toBe(mockBatchResponse);
  });

  it('Should return an array of average ratings with multiple undefined values because recipes have ratings', async () => {
    const mockBatchResponse = [
      undefined,
      fakeAverageRating,
      undefined,
      fakeAverageRating,
    ];

    mockRatingsRepoGetRecipeRatingsBatch.mockResolvedValueOnce(
      mockBatchResponse
    );

    const ratings = await ratingsService.getRecipeRatingsBatch(recipeIds);

    expect(ratings).toBe(mockBatchResponse);
  });

  it('Should return an array of average ratings with no undefined values', async () => {
    const ratings = await ratingsService.getRecipeRatingsBatch(recipeIds);

    expect(ratings).toEqual(
      Array.from<number>({ length: arrayLength }).fill(fakeAverageRating)
    );
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
    const updatedRecipe = await ratingsService.update(fakeRecipeToUpdate);

    expect(updatedRecipe).toEqual({
      ...fakeRecipeToUpdate,
      createdAt: expect.any(Date),
    });
  });
});

describe('remove', async () => {
  const userId = fakeRecipeToRate.userId;
  const recipeId = fakeRecipeToRate.recipeId;

  it('Should throw an error when recipe does not exist', async () => {
    mockValidateRecipeExists.mockRejectedValueOnce(new RecipeNotFound());

    await expect(ratingsService.remove(userId, recipeId)).rejects.toThrow(
      /not found/i
    );
  });

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
