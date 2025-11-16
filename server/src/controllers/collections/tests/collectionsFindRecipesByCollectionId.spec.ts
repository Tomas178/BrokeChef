import type { CollectionsService } from '@server/services/collectionsService';
import { createCallerFactory } from '@server/trpc';
import type { Database } from '@server/database';
import { fakeRecipe, fakeUser } from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import CollectionNotFound from '@server/utils/errors/collections/CollectionNotFound';
import collectionsRouter from '..';

const mockFindRecipesByCollectionId = vi.fn();

const mockCollectionsService: Partial<CollectionsService> = {
  findRecipesByCollectionId: mockFindRecipesByCollectionId,
};

vi.mock('@server/services/collectionsService', () => ({
  collectionsService: () => mockCollectionsService,
}));

const createCaller = createCallerFactory(collectionsRouter);
const database = {} as Database;

const user = fakeUser();
const collectionId = 123;

const recipes = [fakeRecipe(), fakeRecipe()];

beforeEach(() => vi.resetAllMocks());

describe('Unauthenticated tests', () => {
  const { findRecipesByCollectionId } = createCaller(
    requestContext({ database })
  );

  it('Should thrown an error if user is not authenticated', async () => {
    await expect(findRecipesByCollectionId(collectionId)).rejects.toThrow(
      /unauthenticated/i
    );
    expect(mockFindRecipesByCollectionId).not.toHaveBeenCalled();
  });
});

describe('Authenticated tests', () => {
  const { findRecipesByCollectionId } = createCaller(
    authContext({ database }, user)
  );

  it('Should throw an error if collection does not exist', async () => {
    mockFindRecipesByCollectionId.mockRejectedValueOnce(
      new CollectionNotFound()
    );

    await expect(findRecipesByCollectionId(collectionId)).rejects.toThrow(
      /not found/i
    );
  });

  it('Should rethrow any other error', async () => {
    const errorMessage = 'Something happened';
    mockFindRecipesByCollectionId.mockRejectedValueOnce(
      new Error(errorMessage)
    );

    await expect(findRecipesByCollectionId(collectionId)).rejects.toThrow(
      errorMessage
    );
  });

  it('Should return all the recipes', async () => {
    mockFindRecipesByCollectionId.mockResolvedValueOnce(recipes);

    await expect(findRecipesByCollectionId(collectionId)).resolves.toEqual(
      recipes
    );
  });
});
