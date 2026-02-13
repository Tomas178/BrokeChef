import { createCallerFactory } from '@server/trpc';
import { fakeUser } from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import type { RatingsService } from '@server/services/ratingsService';
import type { Database } from '@server/database';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import ratingsRouter from '..';

const mockGetUsersRatingForRecipe = vi.fn();

const mockRatingsService: Partial<RatingsService> = {
  getUserRatingForRecipe: mockGetUsersRatingForRecipe,
};

vi.mock('@server/services/ratingsService', () => ({
  ratingsService: () => mockRatingsService,
}));

const createCaller = createCallerFactory(ratingsRouter);
const database = {} as Database;

const user = fakeUser();
const recipeId = 123;

const ratingForRecipe = 3;

beforeEach(() => vi.resetAllMocks());

describe('Unauthenticated tests', () => {
  const { getUserRatingForRecipe } = createCaller(requestContext({ database }));

  it('Should throw an error if user is not authenticated', async () => {
    await expect(getUserRatingForRecipe({ id: recipeId })).rejects.toThrow(
      /unauthenticated/i
    );
    expect(mockGetUsersRatingForRecipe).not.toHaveBeenCalled();
  });
});

describe('Authenticated tests', () => {
  const { getUserRatingForRecipe } = createCaller(
    authContext({ database }, user)
  );

  it('Should throw an error if recipe is not found', async () => {
    mockGetUsersRatingForRecipe.mockRejectedValueOnce(new RecipeNotFound());

    await expect(getUserRatingForRecipe({ id: recipeId })).rejects.toThrow(
      /not found/i
    );
  });

  it('Should rethrow any other error', async () => {
    mockGetUsersRatingForRecipe.mockRejectedValueOnce(
      new Error('Network error')
    );

    await expect(getUserRatingForRecipe({ id: recipeId })).rejects.toThrow(
      /unexpected/i
    );
  });

  it('Should return the rating that user gave for the recipe', async () => {
    mockGetUsersRatingForRecipe.mockResolvedValueOnce(ratingForRecipe);

    const rating = await getUserRatingForRecipe({ id: recipeId });

    expect(mockGetUsersRatingForRecipe).toHaveBeenCalledWith(recipeId, user.id);
    expect(rating).toBe(ratingForRecipe);
  });
});
