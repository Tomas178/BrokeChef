import { createCallerFactory } from '@server/trpc';
import {
  fakeUser,
  fakeRecipeAllInfoWithoutEmail,
} from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import type { RecipesService } from '@server/services/recipesService';
import type { Database } from '@server/database';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import recipesRouter from '..';

const mockFindById = vi.fn();

const mockRecipesService: Partial<RecipesService> = {
  findById: mockFindById,
};

vi.mock('@server/services/recipesService', () => ({
  recipesService: () => mockRecipesService,
}));

const createCaller = createCallerFactory(recipesRouter);
const database = {} as Database;

const user = fakeUser();
const recipeId = 123;

beforeEach(() => vi.resetAllMocks());

describe('Unauthenticated tests', () => {
  const { findById } = createCaller(requestContext({ database }));

  it('Should throw an error if user is not authenticated', async () => {
    await expect(findById({ id: recipeId })).rejects.toThrow(
      /unauthenticated/i
    );
  });
});

describe('Authenticated tests', () => {
  const { findById } = createCaller(authContext({ database }, user));

  it('Should throw an error if the recipe does not exist', async () => {
    mockFindById.mockRejectedValueOnce(new RecipeNotFound());

    await expect(findById({ id: recipeId })).rejects.toThrow(/not found/i);
  });

  it('Should rethrow any other error', async () => {
    mockFindById.mockRejectedValueOnce(new Error('Network error'));

    await expect(findById({ id: recipeId })).rejects.toThrow(/unexpected/i);
  });

  it('Should return a recipe', async () => {
    const fakeRecipeData = fakeRecipeAllInfoWithoutEmail({
      steps: ['Step 1', 'Step 2'],
    });

    mockFindById.mockResolvedValueOnce(fakeRecipeData);

    const recipeResponse = await findById({ id: recipeId });

    expect(recipeResponse).toStrictEqual(fakeRecipeData);
  });
});
