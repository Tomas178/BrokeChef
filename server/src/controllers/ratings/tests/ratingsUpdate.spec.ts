import { createCallerFactory } from '@server/trpc';
import { authContext, requestContext } from '@tests/utils/context';
import { fakeRating, fakeUser } from '@server/entities/tests/fakes';
import type { RatingsService } from '@server/services/ratingsService';
import type { Database } from '@server/database';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import ratingsRouter from '..';

const mockUpdate = vi.fn();

const mockRatingsService: Partial<RatingsService> = {
  update: mockUpdate,
};

vi.mock('@server/services/ratingsService', () => ({
  ratingsService: () => mockRatingsService,
}));

const createCaller = createCallerFactory(ratingsRouter);
const database = {} as Database;

const user = fakeUser();

const recipeId = 123;
const ratingForUpdate = 2;

beforeEach(() => vi.resetAllMocks());

describe('Unauthenticated tests', () => {
  const { update } = createCaller(requestContext({ database }));

  it('Should throw an error if user is not authenticated', async () => {
    await expect(update(fakeRating())).rejects.toThrow(/unauthenticated/i);
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

describe('Authenticated tests', () => {
  const { update } = createCaller(authContext({ database }, user));

  it('Should throw an error if recipe is not found', async () => {
    mockUpdate.mockRejectedValueOnce(new RecipeNotFound());

    await expect(update(fakeRating({ recipeId }))).rejects.toThrow(
      /not found/i
    );
  });

  it('Should rethrow any other error', async () => {
    mockUpdate.mockRejectedValueOnce(new Error('Network error'));

    await expect(update(fakeRating({ recipeId }))).rejects.toThrow(
      /unexpected/i
    );
  });

  it('Should update the rating', async () => {
    const updateInput = {
      userId: user.id,
      recipeId,
      rating: ratingForUpdate,
    };

    mockUpdate.mockResolvedValueOnce(updateInput.rating);

    const updatedRating = await update(updateInput);

    expect(mockUpdate).toHaveBeenCalledWith(updateInput);
    expect(updatedRating).toBe(updateInput.rating);
  });
});
