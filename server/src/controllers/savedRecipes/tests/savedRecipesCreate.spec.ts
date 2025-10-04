import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { authContext, requestContext } from '@tests/utils/callers';
import { insertAll } from '@tests/utils/record';
import { fakeRecipe, fakeUser } from '@server/entities/tests/fakes';
import savedRecipesRouter from '..';

const createCaller = createCallerFactory(savedRecipesRouter);
const database = await wrapInRollbacks(createTestDatabase());

const [userCreator, userSaver] = await insertAll(database, 'users', [
  fakeUser(),
  fakeUser(),
]);

const [recipe] = await insertAll(
  database,
  'recipes',
  fakeRecipe({ userId: userCreator.id })
);

it('Should thrown an error if user is not authenticated', async () => {
  const { save } = createCaller(requestContext({ database }));

  await expect(save(recipe.id)).rejects.toThrow(/unauthenticated/i);
});

it('Should throw an error if recipe is already saved', async () => {
  await insertAll(database, 'savedRecipes', {
    recipeId: recipe.id,
    userId: userSaver.id,
  });

  const { save } = createCaller(authContext({ database }, userSaver));

  await expect(save(recipe.id)).rejects.toThrow(/saved/i);
});

it('Should throw an error if creator is trying to save his own recipe', async () => {
  const { save } = createCaller(authContext({ database }, userCreator));

  await expect(save(recipe.id)).rejects.toThrow(/own|author/i);
});

it('Should create a saved recipe record', async () => {
  const { save } = createCaller(authContext({ database }, userSaver));

  const savedRecipe = await save(recipe.id);

  expect(savedRecipe).toMatchObject({
    userId: userSaver.id,
    recipeId: recipe.id,
  });
});
