import type { RatingsRepository } from '@server/repositories/ratingsRepository';
import type { RecipesRepository } from '@server/repositories/recipesRepository';
import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { authContext, requestContext } from '@tests/utils/context';
import {
  fakeRating,
  fakeRecipe,
  fakeRecipeAllInfo,
  fakeUser,
} from '@server/entities/tests/fakes';
import { insertAll } from '@tests/utils/record';
import ratingsRouter from '..';

const mockRatingsRepositoryUpdate = vi.fn();
const mockRecipesRepositoryFindById = vi.fn();

const mockRatingsRepository: Partial<RatingsRepository> = {
  update: mockRatingsRepositoryUpdate,
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

const [user] = await insertAll(database, 'users', fakeUser());

const [recipe] = await insertAll(
  database,
  'recipes',
  fakeRecipe({ userId: user.id })
);

const ratingForUpdate = 2;

beforeEach(() => {
  mockRatingsRepositoryUpdate.mockReset();
  mockRecipesRepositoryFindById.mockReset();
});

describe('Unauthenticated tests', () => {
  const { update } = createCaller(requestContext({ database }));

  it('Should throw an error if user is not authenticated', async () => {
    await expect(update(fakeRating())).rejects.toThrow(/unauthenticated/i);
  });
});

describe('Authenticated tests', () => {
  const { update } = createCaller(authContext({ database }, user));

  it('Should throw an error if recipe is not found', async () => {
    mockRecipesRepositoryFindById.mockResolvedValueOnce(undefined);

    await expect(update(fakeRating({ recipeId: recipe.id }))).rejects.toThrow(
      /not found/i
    );
  });

  it('Should update the rating', async () => {
    const updateInput = {
      userId: user.id,
      recipeId: recipe.id,
      rating: ratingForUpdate,
    };

    const mockedRating = fakeRating({ ...updateInput });

    mockRecipesRepositoryFindById.mockResolvedValueOnce(
      fakeRecipeAllInfo({ id: recipe.id })
    );

    mockRatingsRepositoryUpdate.mockResolvedValueOnce(mockedRating);

    const updatedRating = await update(updateInput);

    expect(mockRecipesRepositoryFindById).toHaveBeenCalledWith(
      updateInput.recipeId
    );
    expect(mockRatingsRepositoryUpdate).toHaveBeenCalledWith(updateInput);
    expect(updatedRating).toBe(mockedRating.rating);
  });
});
