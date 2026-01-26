import type { CollectionsService } from '@server/services/collectionsService';
import { createCallerFactory } from '@server/trpc';
import {
  fakeUser,
  fakeCollectionRequestData,
  fakeCollection,
} from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import type { Database } from '@server/database';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import CollectionAlreadyCreated from '@server/utils/errors/collections/CollectionAlreadyCreated';
import collectionsRouter from '..';

const mockCreate = vi.fn();

const mockCollectionsService: Partial<CollectionsService> = {
  create: mockCreate,
};

vi.mock('@server/services/collectionsService', () => ({
  collectionsService: () => mockCollectionsService,
}));

const createCaller = createCallerFactory(collectionsRouter);
const database = {} as Database;

const user = fakeUser();
const requestData = fakeCollectionRequestData();
const responseData = fakeCollection(requestData);

beforeEach(() => vi.resetAllMocks());

describe('Unauthenticated tests', () => {
  const { create } = createCaller(requestContext({ database }));

  it('Should thrown an error if user is not authenticated', async () => {
    await expect(create(requestData)).rejects.toThrow(/unauthenticated/i);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});

describe('Authenticated tests', () => {
  const { create } = createCaller(authContext({ database }, user));

  it('Should throw an error if user is not found', async () => {
    mockCreate.mockRejectedValueOnce(new UserNotFound());

    await expect(create(requestData)).rejects.toThrow(/not found/i);
  });

  it('Should throw an error if user has already created the collection with the given title', async () => {
    mockCreate.mockRejectedValueOnce(new CollectionAlreadyCreated());

    await expect(create(requestData)).rejects.toThrow(/already|created|exist/i);
  });

  it('Should rethrow any other error', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Something failed'));

    await expect(create(requestData)).rejects.toThrow(/unexpected/i);
  });

  it('Should create the collection', async () => {
    mockCreate.mockResolvedValueOnce(responseData);

    const createdCollection = await create(requestData);

    expect(createdCollection).toEqual(responseData);
  });
});
