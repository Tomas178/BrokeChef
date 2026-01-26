import { createCallerFactory } from '@server/trpc';
import { authContext, requestContext } from '@tests/utils/context';
import { fakeUser } from '@server/entities/tests/fakes';
import type { SavedRecipesService } from '@server/services/savedRecipesService';
import type { Database } from '@server/database';
import RecipeAlreadySaved from '@server/utils/errors/recipes/RecipeAlreadySaved';
import CannotSaveOwnRecipe from '@server/utils/errors/recipes/CannotSaveOwnRecipe';
import type { SavedRecipesLink } from '@server/repositories/savedRecipesRepository';
import savedRecipesRouter from '..';

const mockCreate = vi.fn();

const mockSavedRecipesService: Partial<SavedRecipesService> = {
  create: mockCreate,
};

vi.mock('@server/services/savedRecipesService', () => ({
  savedRecipesService: () => mockSavedRecipesService,
}));

const createCaller = createCallerFactory(savedRecipesRouter);
const database = {} as Database;

const userSaver = fakeUser();
const recipeId = 123;

const savedRecipeLink: SavedRecipesLink = {
  userId: userSaver.id,
  recipeId,
};

beforeEach(() => vi.resetAllMocks());

describe('Unauthenticated tests', () => {
  const { save } = createCaller(requestContext({ database }));

  it('Should throw an error if user is not authenticated', async () => {
    await expect(save(recipeId)).rejects.toThrow(/unauthenticated/i);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});

describe('Authenticated tests', () => {
  const { save } = createCaller(authContext({ database }, userSaver));

  it('Should throw an error if creator is trying to save his own recipe', async () => {
    mockCreate.mockRejectedValueOnce(new CannotSaveOwnRecipe());

    await expect(save(recipeId)).rejects.toThrow(/own|author/i);
    expect(mockCreate).toHaveBeenCalledOnce();
  });

  it('Should throw an error if recipe is already saved', async () => {
    mockCreate.mockRejectedValueOnce(new RecipeAlreadySaved());

    await expect(save(recipeId)).rejects.toThrow(/saved/i);
    expect(mockCreate).toHaveBeenCalledOnce();
  });

  it('Should rethrow any other error', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Something happened'));

    await expect(save(recipeId)).rejects.toThrow(/unexpected/i);
  });

  it('Should create a saved recipe record', async () => {
    mockCreate.mockResolvedValueOnce(savedRecipeLink);

    const savedRecipe = await save(recipeId);

    expect(mockCreate).toHaveBeenCalledOnce();
    expect(savedRecipe).toMatchObject({
      userId: userSaver.id,
      recipeId,
    });
  });
});
