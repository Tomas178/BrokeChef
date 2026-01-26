import { createCallerFactory } from '@server/trpc';
import { fakeRating, fakeUser } from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import type { Database } from '@server/database';
import type { RatingsService } from '@server/services/ratingsService';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import RecipeAlreadyRated from '@server/utils/errors/recipes/RecipeAlreadyRated';
import CannotRateOwnRecipe from '@server/utils/errors/recipes/CannotRateOwnRecipe';
import ratingsRouter from '..';

const mockCreate = vi.fn();

const mockRatingsService: Partial<RatingsService> = {
  create: mockCreate,
};

vi.mock('@server/services/ratingsService', () => ({
  ratingsService: () => mockRatingsService,
}));

const createCaller = createCallerFactory(ratingsRouter);
const database = {} as Database;

const user = fakeUser();

const recipeId = 123;

beforeEach(() => vi.resetAllMocks());

describe('Unauthenticated tests', () => {
  const { rate } = createCaller(requestContext({ database }));

  it('Should throw an error if user is not authenticated', async () => {
    await expect(rate(fakeRating())).rejects.toThrow(/unauthenticated/i);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});

describe('Authenticated tests', () => {
  const { rate } = createCaller(authContext({ database }, user));

  it('Should throw an error if recipe is not found', async () => {
    mockCreate.mockRejectedValueOnce(new RecipeNotFound());

    await expect(rate(fakeRating({ recipeId }))).rejects.toThrow(/not found/i);
  });

  it('Should throw an error if recipe is already rated by the user', async () => {
    vi.mock('@server/utils/errors', () => ({
      assertPostgresError: vi.fn(),
    }));

    mockCreate.mockRejectedValueOnce(new RecipeAlreadyRated());

    await expect(rate(fakeRating())).rejects.toThrow(/exists|created|already/i);
  });

  it('Should throw an error if author is trying to rate the recipe', async () => {
    mockCreate.mockRejectedValueOnce(new CannotRateOwnRecipe());

    await expect(rate(fakeRating({ recipeId }))).rejects.toThrow(
      /rate own|own/i
    );
  });

  it('Should rethrow any other error', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Network error'));

    await expect(rate(fakeRating({ recipeId }))).rejects.toThrow(/unexpected/i);
  });

  it('Should create the rating', async () => {
    const ratingInput = {
      userId: user.id,
      recipeId,
      rating: 4,
    };

    mockCreate.mockResolvedValueOnce(ratingInput);

    const rating = await rate(ratingInput);

    expect(mockCreate).toHaveBeenCalledExactlyOnceWith(ratingInput);
    expect(rating).toEqual(ratingInput);
  });
});
