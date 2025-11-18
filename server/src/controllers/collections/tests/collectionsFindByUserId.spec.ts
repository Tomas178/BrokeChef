import type { Database } from '@server/database';
import { createCallerFactory } from '@server/trpc';
import type { CollectionsService } from '@server/services/collectionsService';
import { fakeCollection, fakeUser } from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import collectionsRouter from '..';

const mockFindByUserId = vi.fn();

const mockCollectionsService: Partial<CollectionsService> = {
  findByUserId: mockFindByUserId,
};

vi.mock('@server/services/collectionsService', () => ({
  collectionsService: () => mockCollectionsService,
}));

const createCaller = createCallerFactory(collectionsRouter);
const database = {} as Database;

const user = fakeUser();
const userId = user.id;

beforeEach(() => vi.resetAllMocks());

describe('Unauthenticated tests', () => {
  const { findByUserId } = createCaller(requestContext({ database }));

  it('Should thrown an error if user is not authenticated', async () => {
    await expect(findByUserId(userId)).rejects.toThrow(/unauthenticated/i);
    expect(mockFindByUserId).not.toHaveBeenCalled();
  });
});

describe('Authenticated tests', async () => {
  const { findByUserId } = await createCaller(authContext({ database }, user));

  it('Should throw an error when user is not found', async () => {
    mockFindByUserId.mockRejectedValueOnce(new UserNotFound());

    await expect(findByUserId(userId)).rejects.toThrow(/not found/i);
  });

  it('Should rethrow any other error', async () => {
    const errorMessage = 'Something happened';
    mockFindByUserId.mockRejectedValueOnce(new Error(errorMessage));

    await expect(findByUserId(userId)).rejects.toThrow(errorMessage);
  });

  it('Should call findByUserId with userId from cookies when userId is not provided via argument to the TRPC procedure', async () => {
    await findByUserId();

    expect(mockFindByUserId).toHaveBeenCalledExactlyOnceWith(userId);
  });

  it('Should return an empty array when user has no collections', async () => {
    mockFindByUserId.mockResolvedValueOnce([]);

    await expect(findByUserId(userId)).resolves.toEqual([]);
  });

  it('Should return an array of collections', async () => {
    const collections = [fakeCollection(), fakeCollection(), fakeCollection()];
    mockFindByUserId.mockResolvedValueOnce(collections);

    const retrievedCollections = await findByUserId(userId);

    expect(retrievedCollections).toHaveLength(collections.length);

    expect(retrievedCollections[0]).toEqual(collections[0]);
    expect(retrievedCollections[1]).toEqual(collections[1]);
    expect(retrievedCollections[2]).toEqual(collections[2]);
  });
});
