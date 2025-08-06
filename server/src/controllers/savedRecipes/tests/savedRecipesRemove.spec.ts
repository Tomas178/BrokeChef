import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { clearTables, insertAll } from '@tests/utils/record';
import { authContext, requestContext } from '@tests/utils/context';
import {
  fakeRecipe,
  fakeSavedRecipe,
  fakeUser,
} from '@server/entities/tests/fakes';
import savedRecipesRouter from '..';

const createCaller = createCallerFactory(savedRecipesRouter);
const database = await wrapInRollbacks(createTestDatabase());

await clearTables(database, ['savedRecipes']);

it('Should throw an error if user is not authenticated', async () => {
  const { unsave } = createCaller(requestContext({ db: database }));

  await expect(unsave(1)).rejects.toThrow(/unauthenticated/i);
});

it('Should unsave a recipe', async () => {
  const [user] = await insertAll(database, 'users', fakeUser());

  const { unsave } = createCaller(authContext({ db: database }, user));

  const [recipe] = await insertAll(
    database,
    'recipes',
    fakeRecipe({ userId: user.id })
  );

  const [savedRecipe] = await insertAll(
    database,
    'savedRecipes',
    fakeSavedRecipe({ userId: user.id, recipeId: recipe.id })
  );

  const unsavedRecipe = await unsave(savedRecipe.recipeId);

  expect(unsavedRecipe).toEqual(savedRecipe);
});
