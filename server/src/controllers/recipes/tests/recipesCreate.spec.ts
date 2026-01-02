import { createCallerFactory } from '@server/trpc';
import { authContext, requestContext } from '@tests/utils/context';
import { fakeCreateRecipeData, fakeUser } from '@server/entities/tests/fakes';
import { pick } from 'lodash-es';
import { recipesKeysPublic } from '@server/entities/recipes';
import { joinStepsToSingleString } from '@server/services/utils/joinStepsToSingleString';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import type { Database } from '@server/database';
import RecipeAlreadyCreated from '@server/utils/errors/recipes/RecipeAlreadyCreated';
import type { RecipesService } from '@server/services/recipesService';
import recipesRouter from '..';

const mockCreateRecipe = vi.fn();

const mockRecipesService: Partial<RecipesService> = {
  createRecipe: mockCreateRecipe,
};

vi.mock('@server/services/recipesService', () => ({
  recipesService: () => mockRecipesService,
}));

const createCaller = createCallerFactory(recipesRouter);
const database = {} as Database;

const user = fakeUser();

beforeEach(() => vi.resetAllMocks());

describe('Unauthenticated tests', () => {
  const { create } = createCaller(requestContext({ database }));

  it('Should throw an error if user is not authenticated', async () => {
    await expect(create(fakeCreateRecipeData())).rejects.toThrow(
      /unauthenticated/i
    );
    expect(mockCreateRecipe).not.toHaveBeenCalled();
  });
});

describe('Authenticated tests', () => {
  const { create } = createCaller(authContext({ database }, user));

  it('Should create a persisted recipe', async () => {
    const createRecipeData = fakeCreateRecipeData();
    const stepsInASingleString = joinStepsToSingleString(
      createRecipeData.steps
    );

    mockCreateRecipe.mockResolvedValueOnce({
      ...createRecipeData,
      id: 1,
      steps: stepsInASingleString,
    });

    const recipeCreated = await create(createRecipeData);

    expect(mockCreateRecipe).toHaveBeenCalledExactlyOnceWith(
      createRecipeData,
      user.id
    );

    expect(recipeCreated).toMatchObject({
      ...pick(createRecipeData, recipesKeysPublic),
      steps: stepsInASingleString,
    });
  });

  it('Should throw an error on failure to create recipe when userId is not found', async () => {
    mockCreateRecipe.mockRejectedValueOnce(new UserNotFound());

    const { create } = createCaller(
      authContext(
        { database },
        { ...user, id: user.id.replaceAll(/[a-z]/gi, 'a') }
      )
    );

    await expect(create(fakeCreateRecipeData())).rejects.toThrow(/not found/i);
  });

  it('Should throw a general error when insertion to database fails', async () => {
    mockCreateRecipe.mockRejectedValueOnce(
      new Error('Failed to inserto into db')
    );

    await expect(create(fakeCreateRecipeData())).rejects.toThrow(/failed/i);
  });

  it('Should throw an error if recipe with the given title is already created by the user', async () => {
    mockCreateRecipe.mockRejectedValueOnce(new RecipeAlreadyCreated());

    await expect(create(fakeCreateRecipeData())).rejects.toThrow(
      /already|created/i
    );
  });
});
