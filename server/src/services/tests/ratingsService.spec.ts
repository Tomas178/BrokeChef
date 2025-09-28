import { fakeRating } from '@server/entities/tests/fakes';
import { ratingsService as buildRatingsService } from '@server/services/ratingsService';
import type { Database, Ratings } from '@server/database';
import type { RatingsRepository } from '@server/repositories/ratingsRepository';
import { NoResultError, type Insertable } from 'kysely';
import type { RecipesRepository } from '@server/repositories/recipesRepository';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import CannotRateOwnRecipe from '@server/utils/errors/recipes/CannotRateOwnRecipe';
import { PostgresError } from 'pg-error-enum';
import type { RatingsPublic } from '../../entities/ratings';

const mockValidateRecipeExists = vi.hoisted(() => vi.fn());
const mockValidateRecipeAndUserIsNotAuthor = vi.hoisted(() => vi.fn());

vi.mock('@server/services/utils/recipeValidations', () => ({
  validateRecipeExists: mockValidateRecipeExists,
  validateRecipeAndUserIsNotAuthor: mockValidateRecipeAndUserIsNotAuthor,
}));

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
);

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
);

const mockRatingsRepoRemove = vi.fn(
  async (recipeId: number, userId: string): Promise<RatingsPublic> =>
    fakeRating({
      userId,
      recipeId,
    })
);

const mockRatingsRepository = {
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
