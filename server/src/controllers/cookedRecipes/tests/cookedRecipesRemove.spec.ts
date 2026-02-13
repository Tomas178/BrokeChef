import type { CookedRecipesService } from '@server/services/cookedRecipesService';
import { createCallerFactory } from '@server/trpc';
import type { Database } from '@server/database';
import { fakeUser } from '@server/entities/tests/fakes';
import type { CookedRecipesLink } from '@server/repositories/cookedRecipesRepository';
import { authContext, requestContext } from '@tests/utils/context';
import CookedRecipeNotFound from '@server/utils/errors/recipes/CookedRecipeNotFound';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import cookedRecipesRouter from '..';

const mockRemove = vi.fn();

const mockCookedRecipesService: Partial<CookedRecipesService> = {
  remove: mockRemove,
};

vi.mock('@server/services/cookedRecipesService', () => ({
  cookedRecipesService: () => mockCookedRecipesService,
}));

const createCaller = createCallerFactory(cookedRecipesRouter);
const database = {} as Database;

const user = fakeUser();
const recipeId = 123;

const cookedRecipeLink: CookedRecipesLink = {
  userId: user.id,
  recipeId,
};

beforeEach(() => vi.resetAllMocks());

describe('Unauthenticated tests', () => {
  const { unmark } = createCaller(requestContext({ database }));

  it('Should throw an error if user is not authenticated', async () => {
    await expect(unmark({ id: recipeId })).rejects.toThrow(/unauthenticated/i);
    expect(mockRemove).not.toHaveBeenCalled();
  });
});

describe('Authenticated tests', () => {
  const { unmark } = createCaller(authContext({ database }, user));

  afterEach(() => expect(mockRemove).toHaveBeenCalledOnce());

  it('Should throw an error if recipe is not found', async () => {
    mockRemove.mockRejectedValueOnce(new RecipeNotFound());

    await expect(unmark({ id: recipeId })).rejects.toThrow(/not found/i);
  });

  it('Should throw an error if cooked recipe record is not found', async () => {
    mockRemove.mockRejectedValueOnce(new CookedRecipeNotFound());

    await expect(unmark({ id: recipeId })).rejects.toThrow(/not found/i);
  });

  it('Should throw general error if any other error occurs', async () => {
    mockRemove.mockRejectedValueOnce(new Error('Something else happened'));

    await expect(unmark({ id: recipeId })).rejects.toThrow(/unexpected/i);
  });

  it('Should unmark the cooked recipe record', async () => {
    mockRemove.mockResolvedValueOnce(cookedRecipeLink);

    const unmarkedRecipe = await unmark({ id: recipeId });

    expect(unmarkedRecipe).toEqual({
      ...cookedRecipeLink,
      createdAt: expect.any(Date),
    });
  });
});
