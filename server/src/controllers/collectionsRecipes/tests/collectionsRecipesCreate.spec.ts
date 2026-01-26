import type { Database } from '@server/database';
import type { CollectionsRecipesService } from '@server/services/collectionsRecipesService';
import { createCallerFactory } from '@server/trpc';
import { fakeUser } from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import type { CollectionsRecipesRequest } from '@server/entities/collectionsRecipes';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import CollectionNotFound from '@server/utils/errors/collections/CollectionNotFound';
import CollectionRecipesLinkAlreadyExists from '@server/utils/errors/collections/CollectionRecipeLinkAlreadyExists';
import collectionsRecipesRouter from '..';

const mockCreate = vi.fn();

const mockCollectionsRecipesService: Partial<CollectionsRecipesService> = {
  create: mockCreate,
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
  const { save } = createCaller(requestContext({ database }));

  it('Should throw an error if user is not authenticated', async () => {
    await expect(save(request)).rejects.toThrow(/unauthenticated/i);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});

describe('Authenticated tests', () => {
  const { save } = createCaller(authContext({ database }, user));

  it('Should throw an error if recipe is not found', async () => {
    mockCreate.mockRejectedValueOnce(new RecipeNotFound());

    await expect(save(request)).rejects.toThrow(/not found/i);
  });

  it('Should throw an error if collection is not found', async () => {
    mockCreate.mockRejectedValueOnce(new CollectionNotFound());

    await expect(save(request)).rejects.toThrow(/not found/i);
  });

  it('Should throw an error if collection recipe link already exists', async () => {
    mockCreate.mockRejectedValueOnce(new CollectionRecipesLinkAlreadyExists());

    await expect(save(request)).rejects.toThrow(/already|saved/i);
  });

  it('Should rethrow any other error', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Something happened'));

    await expect(save(request)).rejects.toThrow(/unexpected/i);
  });

  it('Should create the link', async () => {
    mockCreate.mockResolvedValueOnce(request);

    const createdLink = await save(request);

    expect(createdLink).toEqual(request);
  });
});
