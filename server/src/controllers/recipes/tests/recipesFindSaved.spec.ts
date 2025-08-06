import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { clearTables, insertAll } from '@tests/utils/record';
import {
  fakeRecipe,
  fakeSavedRecipe,
  fakeUser,
} from '@server/entities/tests/fakes';
import recipesRouter from '..';

const createCaller = createCallerFactory(recipesRouter);
const database = await wrapInRollbacks(createTestDatabase());

await clearTables(database, ['recipes', 'savedRecipes']);
const [user] = await insertAll(database, 'users', fakeUser());

const { findSaved } = createCaller({ db: database });

it('Should return an empty list if there are no recipes saved by user', async () => {
  expect(await findSaved({ userId: user.id })).toHaveLength(0);
});

it('Should return a list of recipes', async () => {
  const [createdRecipe] = await insertAll(
    database,
    'recipes',
    fakeRecipe({ userId: user.id })
  );

  await insertAll(
    database,
    'savedRecipes',
    fakeSavedRecipe({
      userId: createdRecipe.userId,
      recipeId: createdRecipe.id,
    })
  );

  const recipes = await findSaved({ userId: user.id });

  expect(recipes).toHaveLength(1);
});

it('Should return the latest recipes first', async () => {
  const [recipeOne, recipeTwo] = await insertAll(database, 'recipes', [
    fakeRecipe({ userId: user.id }),
    fakeRecipe({ userId: user.id }),
  ]);

  await insertAll(database, 'savedRecipes', [
    fakeSavedRecipe({ userId: user.id, recipeId: recipeOne.id }),
    fakeSavedRecipe({ userId: user.id, recipeId: recipeTwo.id }),
  ]);

  const recipes = await findSaved({ userId: user.id });

  expect(recipes[0].id).toBe(recipeTwo.id);
  expect(recipes[1].id).toBe(recipeOne.id);
});
