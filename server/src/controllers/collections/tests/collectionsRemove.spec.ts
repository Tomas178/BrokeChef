import type { Database } from '@server/database';
import { createCallerFactory } from '@server/trpc';
import type { CollectionsService } from '@server/services/collectionsService';
import type { CollectionsRepository } from '@server/repositories/collectionsRepository';
import { fakeCollection, fakeUser } from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import CollectionNotFound from '@server/utils/errors/collections/CollectionNotFound';
import { S3ServiceException } from '@aws-sdk/client-s3';
import collectionsRouter from '..';

const mockIsAuthor = vi.fn(async () => true);

const mockCollectionsRepository: Partial<CollectionsRepository> = {
  isAuthor: mockIsAuthor,
};

vi.mock('@server/repositories/collectionsRepository', () => ({
  collectionsRepository: () => mockCollectionsRepository,
}));

const mockRemove = vi.fn();

const mockCollectionsService: Partial<CollectionsService> = {
  remove: mockRemove,
};

vi.mock('@server/services/collectionsService', () => ({
  collectionsService: () => mockCollectionsService,
}));

const createCaller = createCallerFactory(collectionsRouter);
const database = {} as Database;

const user = fakeUser();
const collectionId = 123;

beforeEach(() => vi.resetAllMocks());

describe('Unauthenticated tests', () => {
  const { remove } = createCaller(requestContext({ database }));

  it('Should throw an error if user is not authenticated', async () => {
    await expect(remove(collectionId)).rejects.toThrow(/unauthenticated/i);
  });
});

describe('Authenticated tests', () => {
  const { remove } = createCaller(authContext({ database }, user));

  it('Should throw an error if user is not the collection author', async () => {
    mockIsAuthor.mockResolvedValueOnce(false);

    await expect(remove(collectionId)).rejects.toThrow(/author|remove|only/i);
  });

  it('Should throw an error if collection does not exist', async () => {
    mockRemove.mockRejectedValueOnce(new CollectionNotFound());

    await expect(remove(collectionId)).rejects.toThrow(/not found/i);
  });

  it('Should throw an error if failure happened upon deleting collection image from S3', async () => {
    mockRemove.mockRejectedValueOnce(new S3ServiceException({} as any));

    await expect(remove(collectionId)).rejects.toThrow(/failed/i);
  });

  it('Should rethrow any other error', async () => {
    const errorMessage = 'Something happened';
    mockRemove.mockRejectedValueOnce(new Error(errorMessage));

    await expect(remove(collectionId)).rejects.toThrow(errorMessage);
  });

  it('Should return nothing when recipe was removed', async () => {
    const removedCollection = fakeCollection();

    mockRemove.mockResolvedValueOnce(removedCollection);

    await expect(remove(collectionId)).resolves.toBeUndefined();
  });
});
