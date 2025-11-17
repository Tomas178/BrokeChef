import type { CollectionsService } from '@server/services/collectionsService';
import { createCallerFactory } from '@server/trpc';
import type { Database } from '@server/database';
import { fakeUser } from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import collectionsRouter from '..';

const mockTotalCollectionsByUser = vi.fn();

const mockCollectionsService: Partial<CollectionsService> = {
  totalCollectionsByUser: mockTotalCollectionsByUser,
};

vi.mock('@server/services/collectionsService', () => ({
  collectionsService: () => mockCollectionsService,
}));

const createCaller = createCallerFactory(collectionsRouter);
const database = {} as Database;

const user = fakeUser();
const userId = user.id;

const totalCollectionsCount = 5;

beforeEach(() => vi.resetAllMocks());

describe('Unauthenticated tests', () => {
  const { totalCollectionsByUser } = createCaller(requestContext({ database }));

  it('Should thrown an error if user is not authenticated', async () => {
    await expect(totalCollectionsByUser(userId)).rejects.toThrow(
      /unauthenticated/i
    );
    expect(mockTotalCollectionsByUser).not.toHaveBeenCalled();
  });
});

describe('Authenticated tests', () => {
  const { totalCollectionsByUser } = createCaller(
    authContext({ database }, user)
  );

  it('Should throw an error if user does not exist', async () => {
    mockTotalCollectionsByUser.mockRejectedValueOnce(new UserNotFound());

    await expect(totalCollectionsByUser(userId)).rejects.toThrow(/not found/i);
  });

  it('Should rethrow any other error', async () => {
    const errorMessage = 'Something happened';
    mockTotalCollectionsByUser.mockRejectedValueOnce(new Error(errorMessage));

    await expect(totalCollectionsByUser(userId)).rejects.toThrow(errorMessage);
  });

  it('Should call totalCollectionsByUser with userId from cookies return user when not given userId but authenticanted', async () => {
    mockTotalCollectionsByUser.mockResolvedValueOnce(user);

    const userByAuth = await totalCollectionsByUser();

    expect(mockTotalCollectionsByUser).toHaveBeenCalledExactlyOnceWith(user.id);
    expect(userByAuth).toEqual(user);
  });

  it('Should return the total count of collections that user has created', async () => {
    mockTotalCollectionsByUser.mockResolvedValueOnce(totalCollectionsCount);

    await expect(totalCollectionsByUser(userId)).resolves.toBe(
      totalCollectionsCount
    );
  });
});
