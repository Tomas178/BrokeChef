import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { insertAll } from '@tests/utils/record';
import { fakeRating, fakeRecipe, fakeUser } from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import type { RatingsRepository } from '@server/repositories/ratingsRepository';
import { NoResultError } from 'kysely';
import ratingsRouter from '..';

const mockRatingsRepositoryRemove = vi.fn();

const mockRatingsRepository: Partial<RatingsRepository> = {
  remove: mockRatingsRepositoryRemove,
};

vi.mock('@server/repositories/ratingsRepository', () => ({
  ratingsRepository: () => mockRatingsRepository,
}));

const createCaller = createCallerFactory(ratingsRouter);
const database = await wrapInRollbacks(createTestDatabase());

const [user] = await insertAll(database, 'users', fakeUser());
const [recipe] = await insertAll(
  database,
  'recipes',
  fakeRecipe({ userId: user.id })
);

beforeEach(() => mockRatingsRepositoryRemove.mockReset());

describe('Unauthenticated tests', () => {
  const { remove } = createCaller(requestContext({ database }));

  it('Should throw an error if user is not authenticated', async () => {
    await expect(remove(recipe.id)).rejects.toThrow(/unauthenticated/i);
  });
});

describe('Authenticated tests', () => {
  const { remove } = createCaller(authContext({ database }, user));

  it('Should throw an error if rating is not found', async () => {
    mockRatingsRepositoryRemove.mockRejectedValueOnce(
      new NoResultError({} as any)
    );

    await expect(remove(recipe.id)).rejects.toThrow(/not found/i);
  });

  it('Should remove the rating', async () => {
    const mockedRating = fakeRating({ userId: user.id, recipeId: recipe.id });

    mockRatingsRepositoryRemove.mockResolvedValueOnce(mockedRating);

    const removedRating = await remove(mockedRating.recipeId);

    expect(mockRatingsRepositoryRemove).toHaveBeenCalledOnce();
    expect(mockRatingsRepositoryRemove).toHaveBeenCalledWith(
      mockedRating.recipeId,
      mockedRating.userId
    );
    expect(removedRating).toBe(mockedRating.rating);
  });
});
