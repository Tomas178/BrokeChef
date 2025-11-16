import type { Database } from '@server/database';
import type { CollectionsRecipesService } from '@server/services/collectionsRecipesService';
import { createCallerFactory } from '@server/trpc';
import { fakeUser } from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import type { CollectionsRecipesRequest } from '@server/entities/collectionsRecipes';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import CollectionNotFound from '@server/utils/errors/collections/CollectionNotFound';
import CollectionRecipeLinkNotFound from '@server/utils/errors/collections/CollectionRecipeLinkNotFound';
import collectionsRecipesRouter from '..';

const mockRemove = vi.fn();

const mockCollectionsRecipesService: Partial<CollectionsRecipesService> = {
  remove: mockRemove,
};

vi.mock('@server/services/collectionsRecipesService', () => ({
  collectionsRecipesService: () => mockCollectionsRecipesService,
}));

const createCaller = createCallerFactory(collectionsRecipesRouter);
const database = {} as Database;

const user = fakeUser();
const collectionId = 123;
const recipeId = 123;

const request: CollectionsRecipesRequest = {
  collectionId,
  recipeId,
};

beforeEach(() => vi.resetAllMocks());

describe('Unauthenticated tests', () => {
  const { unsave } = createCaller(requestContext({ database }));

  it('Should throw an error if user is not authenticated', async () => {
    await expect(unsave(request)).rejects.toThrow(/unauthenticated/i);
    expect(mockRemove).not.toHaveBeenCalled();
  });
});

describe('Authenticated tests', () => {
  const { unsave } = createCaller(authContext({ database }, user));

  it('Should throw an error if recipe is not found', async () => {
    mockRemove.mockRejectedValueOnce(new RecipeNotFound());

    await expect(unsave(request)).rejects.toThrow(/not found/i);
  });

  it('Should throw an error if collection is not found', async () => {
    mockRemove.mockRejectedValueOnce(new CollectionNotFound());

    await expect(unsave(request)).rejects.toThrow(/not found/i);
  });

  it('Should throw an error if the collectionRecipes link is not found', async () => {
    mockRemove.mockRejectedValueOnce(new CollectionRecipeLinkNotFound());

    await expect(unsave(request)).rejects.toThrow(/no|not found|no.*saved/i);
  });

  it('Should rethrow any other error', async () => {
    const errorMessage = 'Something happened';
    mockRemove.mockRejectedValueOnce(new Error(errorMessage));

    await expect(unsave(request)).rejects.toThrow(errorMessage);
  });

  it('Should remove the link', async () => {
    mockRemove.mockResolvedValueOnce(request);

    await expect(unsave(request)).resolves.toBeUndefined();
  });
});
