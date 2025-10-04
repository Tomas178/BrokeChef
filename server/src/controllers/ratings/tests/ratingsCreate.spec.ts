import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { insertAll } from '@tests/utils/record';
import {
  fakeRating,
  fakeRecipe,
  fakeRecipeAllInfo,
  fakeUser,
} from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import type { RatingsRepository } from '@server/repositories/ratingsRepository';
import type { RecipesRepository } from '@server/repositories/recipesRepository';
import { PostgresError } from 'pg-error-enum';
import ratingsRouter from '..';

const mockRatingsRepositoryCreate = vi.fn();
const mockRecipesRepositoryFindById = vi.fn();

const mockRatingsRepository: Partial<RatingsRepository> = {
  create: mockRatingsRepositoryCreate,
};

const mockRecipesRepository: Partial<RecipesRepository> = {
  findById: mockRecipesRepositoryFindById,
};

vi.mock('@server/repositories/ratingsRepository', () => ({
  ratingsRepository: () => mockRatingsRepository,
}));

vi.mock('@server/repositories/recipesRepository', () => ({
  recipesRepository: () => mockRecipesRepository,
}));

const createCaller = createCallerFactory(ratingsRouter);
const database = await wrapInRollbacks(createTestDatabase());

const [userAuthor, userRater] = await insertAll(database, 'users', [
  fakeUser(),
  fakeUser(),
]);

const [recipe] = await insertAll(
  database,
  'recipes',
  fakeRecipe({ userId: userAuthor.id })
);

beforeEach(() => {
  mockRatingsRepositoryCreate.mockReset();
  mockRecipesRepositoryFindById.mockReset();
});

describe('Unauthenticated tests', () => {
  const { rate } = createCaller(requestContext({ database }));

  it('Should throw an error if user is not authenticated', async () => {
    await expect(rate(fakeRating())).rejects.toThrow(/unauthenticated/i);
  });
});

describe('Authenticated tests', () => {
  const { rate } = createCaller(authContext({ database }, userRater));

  it('Should throw an error if recipe is not found', async () => {
    mockRecipesRepositoryFindById.mockResolvedValueOnce(undefined);

    await expect(rate(fakeRating({ recipeId: recipe.id }))).rejects.toThrow(
      /not found/i
    );
  });

  it('Should throw an error if recipe is already rated by the user', async () => {
    vi.mock('@server/utils/errors', () => ({
      assertPostgresError: vi.fn(),
    }));

    mockRecipesRepositoryFindById.mockResolvedValueOnce(
      fakeRecipeAllInfo({ id: recipe.id, userId: userAuthor.id })
    );

    mockRatingsRepositoryCreate.mockRejectedValueOnce({
      code: PostgresError.UNIQUE_VIOLATION,
    });

    await expect(rate(fakeRating())).rejects.toThrow(/exists|created|already/i);
  });

  it('Should throw an error if author is trying to rate the recipe', async () => {
    mockRecipesRepositoryFindById.mockResolvedValueOnce(
      fakeRecipeAllInfo({ id: recipe.id, userId: userRater.id })
    );

    await expect(rate(fakeRating({ recipeId: recipe.id }))).rejects.toThrow(
      /rate own|own/i
    );
  });

  it('Should create the rating', async () => {
    const ratingInput = {
      userId: userRater.id,
      recipeId: recipe.id,
      rating: 4,
    };

    const mockedRating = fakeRating({ ...ratingInput });

    mockRecipesRepositoryFindById.mockResolvedValueOnce(
      fakeRecipeAllInfo({ id: recipe.id })
    );

    mockRatingsRepositoryCreate.mockResolvedValueOnce(mockedRating);

    const rating = await rate(ratingInput);

    expect(rating).toEqual(mockedRating);
    expect(mockRecipesRepositoryFindById).toHaveBeenCalledWith(
      ratingInput.recipeId
    );
    expect(mockRatingsRepositoryCreate).toHaveBeenCalledWith(ratingInput);
  });
});
