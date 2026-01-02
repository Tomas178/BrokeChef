import { createCallerFactory } from '@server/trpc';
import { fakeRecipeWithRating, fakeUser } from '@server/entities/tests/fakes';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import type { RecipesService } from '@server/services/recipesService';
import type { Database } from '@server/database';
import { authContext, requestContext } from '@tests/utils/context';
import type { RecipesRepository } from '@server/repositories/recipesRepository';
import { S3ServiceException } from '@aws-sdk/client-s3';
import recipesRouter from '..';

const mockIsAuthor = vi.fn(async () => true);

const mockRecipesRepository: Partial<RecipesRepository> = {
  isAuthor: mockIsAuthor,
};

vi.mock('@server/repositories/recipesRepository', () => ({
  recipesRepository: () => mockRecipesRepository,
}));

const mockRemove = vi.fn();

const mockRecipesService: Partial<RecipesService> = {
  remove: mockRemove,
};

vi.mock('@server/services/recipesService', () => ({
  recipesService: () => mockRecipesService,
}));

const createCaller = createCallerFactory(recipesRouter);
const database = {} as Database;

const user = fakeUser();
const recipeId = 26;

beforeEach(() => vi.resetAllMocks());

describe('Unauthenticated tests', () => {
  const { remove } = createCaller(requestContext({ database }));

  it('Should throw an error if user is not authenticated', async () => {
    await expect(remove(recipeId)).rejects.toThrow(/unauthenticated/i);
    expect(mockRemove).not.toHaveBeenCalled();
  });
});

describe('Authenticated tests', () => {
  const { remove } = createCaller(authContext({ database }, user));

  it('Should throw an error if user is not the recipe author', async () => {
    mockIsAuthor.mockResolvedValueOnce(false);

    await expect(remove(recipeId)).rejects.toThrow(/author|remove|only/i);
  });

  it('Should throw an error if recipe does not exist', async () => {
    mockRemove.mockRejectedValueOnce(new RecipeNotFound());

    await expect(remove(recipeId)).rejects.toThrow(/not found/i);
  });

  it('Should throw an error if failure happened upon deleting recipe image from S3', async () => {
    mockRemove.mockRejectedValueOnce(new S3ServiceException({} as any));

    await expect(remove(recipeId)).rejects.toThrow(/failed/i);
  });

  it('Should return nothing when recipe was removed', async () => {
    const removedRecipe = fakeRecipeWithRating();

    mockRemove.mockResolvedValueOnce(removedRecipe);

    await expect(remove(recipeId)).resolves.toBeUndefined();
  });
});
