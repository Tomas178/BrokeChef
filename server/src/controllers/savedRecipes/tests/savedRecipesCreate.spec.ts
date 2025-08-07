import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { authContext, requestContext } from '@tests/utils/context';
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
  const { save } = createCaller(requestContext({ db: database }));

  await expect(
    save({
      userId: userSaver.id,
      recipeId: recipe.id,
    })
  ).rejects.toThrow(/unauthenticated/i);
});

it('Should create a saved recipe record', async () => {
  const { save } = createCaller(authContext({ db: database }, userSaver));

  const savedRecipe = await save({
    userId: userSaver.id,
    recipeId: recipe.id,
  });

  expect(savedRecipe).toMatchObject({
    userId: userSaver.id,
    recipeId: recipe.id,
  });
});
