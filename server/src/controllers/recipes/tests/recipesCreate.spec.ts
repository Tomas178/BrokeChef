import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { authContext, requestContext } from '@tests/utils/context';
import { insertAll } from '@tests/utils/record';
import { fakeCreateRecipeData, fakeUser } from '@server/entities/tests/fakes';
import { pick } from 'lodash-es';
import { recipesKeysPublic } from '@server/entities/recipes';
import { joinStepsToSingleString } from '@server/services/utils/joinStepsToSingleString';
import UserNotFound from '@server/utils/errors/users/UserNotFound';
import recipesRouter from '..';

const { mockCreateRecipe } = vi.hoisted(() => ({
  mockCreateRecipe: vi.fn(),
}));

vi.mock('@server/services/recipesService', async importActual => {
  const actual: any = await importActual();

  return {
    ...actual,
    recipesService: (database_: any) => ({
      ...actual.recipesService(database_),
      createRecipe: mockCreateRecipe,
    }),
  };
});

const createCaller = createCallerFactory(recipesRouter);
const database = await wrapInRollbacks(createTestDatabase());

const [user] = await insertAll(database, 'users', fakeUser());

beforeEach(() => mockCreateRecipe.mockClear());

it('Should throw an error if user is not authenticated', async () => {
  const { create } = createCaller(requestContext({ db: database }));

  await expect(create(fakeCreateRecipeData())).rejects.toThrow(
    /unauthenticated/i
  );
});

it('Should create a persisted recipe', async () => {
  const createRecipeData = fakeCreateRecipeData();
  const stepsInASingleString = joinStepsToSingleString(createRecipeData.steps);

  mockCreateRecipe.mockResolvedValueOnce({
    ...createRecipeData,
    id: 1,
    steps: stepsInASingleString,
  });

  const { create } = createCaller(authContext({ db: database }, user));

  const recipeCreated = await create(createRecipeData);

  expect(recipeCreated).toMatchObject({
    ...pick(createRecipeData, recipesKeysPublic),
    steps: stepsInASingleString,
  });
});

it('Should throw an error on failure to create recipe when userId is not found', async () => {
  mockCreateRecipe.mockRejectedValueOnce(new UserNotFound('1'));

  const { create } = createCaller(
    authContext(
      { db: database },
      { ...user, id: user.id.replaceAll(/[a-z]/gi, 'a') }
    )
  );

  await expect(create(fakeCreateRecipeData())).rejects.toThrow(/not found/i);
});

it('Should throw a general error when insertion to database fails', async () => {
  mockCreateRecipe.mockRejectedValueOnce(
    new Error('Failed to inserto into db')
  );

  const { create } = createCaller(
    authContext(
      { db: database },
      { ...user, id: user.id.replaceAll(/[a-z]/gi, 'a') }
    )
  );

  await expect(create(fakeCreateRecipeData())).rejects.toThrow(/failed/i);
});
