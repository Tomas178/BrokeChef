import type { CollectionsService } from '@server/services/collectionsService';
import { createCallerFactory } from '@server/trpc';
import type { Database } from '@server/database';
import { fakeCollection, fakeUser } from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import CollectionNotFound from '@server/utils/errors/collections/CollectionNotFound';
import collectionsRouter from '..';

const mockFindById = vi.fn();

const mockCollectionsService: Partial<CollectionsService> = {
  findById: mockFindById,
};

vi.mock('@server/services/collectionsService', () => ({
  collectionsService: () => mockCollectionsService,
}));

const createCaller = createCallerFactory(collectionsRouter);
const database = {} as Database;

const user = fakeUser();
const collectionId = 123;
const collection = fakeCollection({ id: collectionId });

beforeEach(() => vi.resetAllMocks());

describe('Unauthenticated tests', () => {
  const { findById } = createCaller(requestContext({ database }));

  it('Should thrown an error if user is not authenticated', async () => {
    await expect(findById({ id: collectionId })).rejects.toThrow(
      /unauthenticated/i
    );
    expect(mockFindById).not.toHaveBeenCalled();
  });
});

describe('Authenticated tests', () => {
  const { findById } = createCaller(authContext({ database }, user));

  it('Should throw an error if collection does not exist', async () => {
    mockFindById.mockRejectedValueOnce(new CollectionNotFound());

    await expect(findById({ id: collectionId })).rejects.toThrow(/not found/i);
  });

  it('Should throw general error any other error', async () => {
    mockFindById.mockRejectedValueOnce(new Error('error'));

    await expect(findById({ id: collectionId })).rejects.toThrow(/unexpected/i);
  });

  it('Should return the collection', async () => {
    mockFindById.mockResolvedValueOnce(collection);

    await expect(findById({ id: collectionId })).resolves.toStrictEqual(
      collection
    );
  });
});
