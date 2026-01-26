import { createCallerFactory } from '@server/trpc';
import { authContext, requestContext } from '@tests/utils/context';
import { fakeUser } from '@server/entities/tests/fakes';
import type { SavedRecipesService } from '@server/services/savedRecipesService';
import type { Database } from '@server/database';
import type { SavedRecipesLink } from '@server/repositories/savedRecipesRepository';
import SavedRecipeNotFound from '@server/utils/errors/recipes/SavedRecipeNotFound';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import savedRecipesRouter from '..';

const mockRemove = vi.fn();

const mockSavedRecipesService: Partial<SavedRecipesService> = {
  remove: mockRemove,
};

vi.mock('@server/services/savedRecipesService', () => ({
  savedRecipesService: () => mockSavedRecipesService,
}));

const createCaller = createCallerFactory(savedRecipesRouter);
const database = {} as Database;

const user = fakeUser();
const recipeId = 123;

const savedRecipeLink: SavedRecipesLink = {
  userId: user.id,
  recipeId,
};

beforeEach(() => vi.resetAllMocks());

describe('Unauthenticated tests', () => {
  const { unsave } = createCaller(requestContext({ database }));

  it('Should throw an error if user is not authenticated', async () => {
    await expect(unsave(1)).rejects.toThrow(/unauthenticated/i);
    expect(mockRemove).not.toHaveBeenCalled();
  });
});

describe('Authenticated tests', () => {
  const { unsave } = createCaller(authContext({ database }, user));

  it('Should throw an error if recipe is not found', async () => {
    mockRemove.mockRejectedValueOnce(new RecipeNotFound());

    await expect(unsave(recipeId)).rejects.toThrow(/not found/i);
    expect(mockRemove).toHaveBeenCalledOnce();
  });

  it('Should throw an error if saved recipe record is not found', async () => {
    mockRemove.mockRejectedValueOnce(new SavedRecipeNotFound());

    await expect(unsave(recipeId)).rejects.toThrow(/not found/i);
    expect(mockRemove).toHaveBeenCalledOnce();
  });

  it('Should rethrow any other error', async () => {
    mockRemove.mockRejectedValueOnce(new Error('Something happened'));

    await expect(unsave(recipeId)).rejects.toThrow(/unexpected/i);
  });

  it('Should unsave a recipe', async () => {
    mockRemove.mockResolvedValueOnce(savedRecipeLink);

    const unsavedRecipe = await unsave(recipeId);

    expect(mockRemove).toHaveBeenCalledOnce();
    expect(unsavedRecipe).toEqual(savedRecipeLink);
  });
});
