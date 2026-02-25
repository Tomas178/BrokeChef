import { createCallerFactory } from '@server/trpc';
import { fakeUser } from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import type { Database } from '@server/database';
import type { RatingsService } from '@server/services/ratingsService';
import RatingNotFound from '@server/utils/errors/recipes/RatingNotFound';
import ratingsRouter from '..';

const mockRemove = vi.fn();

const mockRatingsService: Partial<RatingsService> = {
  remove: mockRemove,
};

vi.mock('@server/services/ratingsService', () => ({
  ratingsService: () => mockRatingsService,
}));

const createCaller = createCallerFactory(ratingsRouter);
const database = {} as Database;

const user = fakeUser();
const recipeId = 123;

const fakeRating = 2.5;

beforeEach(() => vi.resetAllMocks());

describe('Unauthenticated tests', () => {
  const { remove } = createCaller(requestContext({ database }));

  it('Should throw an error if user is not authenticated', async () => {
    await expect(remove({ id: recipeId })).rejects.toThrow(/unauthenticated/i);
    expect(mockRemove).not.toHaveBeenCalled();
  });
});

describe('Authenticated tests', () => {
  const { remove } = createCaller(authContext({ database }, user));

  it('Should throw an error if rating is not found', async () => {
    mockRemove.mockRejectedValueOnce(new RatingNotFound());

    await expect(remove({ id: recipeId })).rejects.toThrow(/not found/i);
  });

  it('Should rethrow any other error', async () => {
    mockRemove.mockRejectedValueOnce(new Error('Network error'));

    await expect(remove({ id: recipeId })).rejects.toThrow(/unexpected/i);
  });

  it('Should remove the rating and return 0 when no ratings for the recipe are left', async () => {
    const zero = 0;
    mockRemove.mockResolvedValueOnce(zero);

    const removedRating = await remove({ id: recipeId });

    expect(mockRemove).toHaveBeenCalledExactlyOnceWith(user.id, recipeId);

    expect(removedRating).toBe(zero);
  });

  it('Should remove the rating and return new rating for the recipe if any ratings are left', async () => {
    mockRemove.mockResolvedValueOnce(fakeRating);

    const removedRating = await remove({ id: recipeId });

    expect(mockRemove).toHaveBeenCalledExactlyOnceWith(user.id, recipeId);

    expect(removedRating).toBe(fakeRating);
  });
});
