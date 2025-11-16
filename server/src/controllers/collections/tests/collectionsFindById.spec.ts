import type { CollectionsService } from '@server/services/collectionsService';
import { createCallerFactory } from '@server/trpc';
import type { Database } from '@server/database';
import { fakeCollection, fakeUser } from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
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
    await expect(findById(collectionId)).rejects.toThrow(/unauthenticated/i);
    expect(mockFindById).not.toHaveBeenCalled();
  });
});

describe('Authenticated tests', () => {
  const { findById } = createCaller(authContext({ database }, user));

  it('Should return undefined if there is no collection found', async () => {
    mockFindById.mockResolvedValueOnce(undefined);

    await expect(findById(collectionId)).resolves.toBeUndefined();
  });

  it('Should return the collection', async () => {
    mockFindById.mockResolvedValueOnce(collection);

    await expect(findById(collectionId)).resolves.toBe(collection);
  });
});
