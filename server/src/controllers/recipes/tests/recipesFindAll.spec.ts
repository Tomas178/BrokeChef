import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { clearTables, insertAll } from '@tests/utils/record';
import { fakeRecipe, fakeUser } from '@server/entities/tests/fakes';
import recipesRouter from '..';

const createCaller = createCallerFactory(recipesRouter);
const database = await wrapInRollbacks(createTestDatabase());

await clearTables(database, ['recipes']);
const [user] = await insertAll(database, 'users', fakeUser());

const { findAll } = createCaller({ db: database });

it('Should return an empty list if there are no recipes', async () => {
  expect(await findAll()).toHaveLength(0);
});

it('Should return a list of recipes', async () => {
  await insertAll(database, 'recipes', fakeRecipe({ userId: user.id }));

  const recipes = await findAll();

  expect(recipes).toHaveLength(1);
});

it('Should return the latest recipe first', async () => {
  const [recipeOld] = await insertAll(
    database,
    'recipes',
    fakeRecipe({ userId: user.id })
  );

  const [recipeNew] = await insertAll(
    database,
    'recipes',
    fakeRecipe({ userId: user.id })
  );

  const recipes = await findAll();

  expect(recipes[0]).toMatchObject(recipeNew);
  expect(recipes[1]).toMatchObject(recipeOld);
});
