import type { RatingsRepository } from '@server/repositories/ratingsRepository';
import type { RecipesRepository } from '@server/repositories/recipesRepository';
import { createTestDatabase } from '@tests/utils/database';
import { insertAll } from '@tests/utils/record';
import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import {
  fakeRecipe,
  fakeRecipeAllInfo,
  fakeUser,
} from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import ratingsRouter from '..';

const mockRatingsRepositoryGetUserRatingForRecipe = vi.fn();
const mockRecipesRepositoryFindById = vi.fn();

const mockRatingsRepository: Partial<RatingsRepository> = {
  getUserRatingForRecipe: mockRatingsRepositoryGetUserRatingForRecipe,
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

const ratingForRecipe = 3;

beforeEach(() => {
  mockRatingsRepositoryGetUserRatingForRecipe.mockReset();
  mockRecipesRepositoryFindById.mockReset();
});

describe('Unauthenticated tests', () => {
  const { getUserRatingForRecipe } = createCaller(requestContext({ database }));

  it('Should throw an error if user is not authenticated', async () => {
    await expect(getUserRatingForRecipe(recipe.id)).rejects.toThrow(
      /unauthenticated/i
    );
  });
});

describe('Authenticated tests', () => {
  const { getUserRatingForRecipe } = createCaller(
    authContext({ database }, user)
  );

  it('Should throw an error if recipe is not found', async () => {
    mockRecipesRepositoryFindById.mockResolvedValueOnce(undefined);

    await expect(getUserRatingForRecipe(recipe.id)).rejects.toThrow(
      /not found/i
    );
  });

  it('Should return the rating that user gave for the recipe', async () => {
    mockRecipesRepositoryFindById.mockResolvedValueOnce(
      fakeRecipeAllInfo({ id: recipe.id })
    );

    mockRatingsRepositoryGetUserRatingForRecipe.mockResolvedValueOnce(
      ratingForRecipe
    );

    const rating = await getUserRatingForRecipe(recipe.id);

    expect(mockRecipesRepositoryFindById).toHaveBeenCalledWith(recipe.id);
    expect(mockRatingsRepositoryGetUserRatingForRecipe).toHaveBeenCalledWith(
      recipe.id,
      user.id
    );
    expect(rating).toBe(ratingForRecipe);
  });
});
