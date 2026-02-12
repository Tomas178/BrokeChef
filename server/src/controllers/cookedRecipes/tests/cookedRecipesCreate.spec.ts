import type { CookedRecipesService } from '@server/services/cookedRecipesService';
import { createCallerFactory } from '@server/trpc';
import type { Database } from '@server/database';
import { fakeUser } from '@server/entities/tests/fakes';
import type { CookedRecipesLink } from '@server/repositories/cookedRecipesRepository';
import { authContext, requestContext } from '@tests/utils/context';
import CannotMarkOwnRecipeAsCooked from '@server/utils/errors/recipes/CannotMarkOwnRecipeAsCooked';
import RecipeAlreadyMarkedAsCooked from '@server/utils/errors/recipes/RecipeAlreadyMarkedAsCooked';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import cookedRecipesRouter from '..';

const mockCreate = vi.fn();

const mockCookedRecipesService: Partial<CookedRecipesService> = {
  create: mockCreate,
};

vi.mock('@server/services/cookedRecipesService', () => ({
  cookedRecipesService: () => mockCookedRecipesService,
}));

const createCaller = createCallerFactory(cookedRecipesRouter);
const database = {} as Database;

const userChef = fakeUser();
const recipeId = 123;

const cookedRecipeLink: CookedRecipesLink = {
  userId: userChef.id,
  recipeId,
};

beforeEach(() => vi.resetAllMocks());

describe('Unauthenticated tests', () => {
  const { mark } = createCaller(requestContext({ database }));

  it('Should thrown an error if user is not authenticated', async () => {
    await expect(mark({ id: recipeId })).rejects.toThrow(/unauthenticated/i);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});

describe('Authenticated tests', () => {
  const { mark } = createCaller(authContext({ database }, userChef));

  afterEach(() => expect(mockCreate).toHaveBeenCalledOnce());

  it('Should throw an error if recipe does not exist', async () => {
    mockCreate.mockRejectedValueOnce(new RecipeNotFound());

    await expect(mark({ id: recipeId })).rejects.toThrow(/not found/i);
  });

  it('Should throw an error if author is trying to mark his own recipe as cooked', async () => {
    mockCreate.mockRejectedValueOnce(new CannotMarkOwnRecipeAsCooked());

    await expect(mark({ id: recipeId })).rejects.toThrow(/failed|mark/i);
  });

  it('Should throw an error if recipe is already marked as cooked', async () => {
    mockCreate.mockRejectedValueOnce(new RecipeAlreadyMarkedAsCooked());

    await expect(mark({ id: recipeId })).rejects.toThrow(/mark|cooked/i);
  });

  it('Should throw general error if any other error occurs', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Something else happened'));

    await expect(mark({ id: recipeId })).rejects.toThrow(/failed|mark/i);
  });

  it('Should create a cooked recipe record', async () => {
    mockCreate.mockResolvedValueOnce(cookedRecipeLink);

    const savedRecipe = await mark({ id: recipeId });

    expect(savedRecipe).toMatchObject({
      userId: userChef.id,
      recipeId,
    });
  });
});
