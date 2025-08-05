import { createCallerFactory } from '@server/trpc';
import recipesRouter from '..';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { clearTables, insertAll } from '@tests/utils/record';
import { fakeRecipe, fakeUser } from '@server/entities/tests/fakes';

const createCaller = createCallerFactory(recipesRouter);
const db = await wrapInRollbacks(createTestDatabase());

await clearTables(db, ['recipes']);
const [user] = await insertAll(db, 'users', fakeUser());

const { findAll } = createCaller({ db });

it('Should return an empty list if there are no recipes', async () => {
  expect(await findAll()).toHaveLength(0);
});

it('Should return a list of recipes', async () => {
  await insertAll(db, 'recipes', fakeRecipe({ userId: user.id }));

  const recipes = await findAll();

  expect(recipes).toHaveLength(1);
});

it('Should return the latest recipe first', async () => {
  const [recipeOld] = await insertAll(
    db,
    'recipes',
    fakeRecipe({ userId: user.id })
  );

  const [recipeNew] = await insertAll(
    db,
    'recipes',
    fakeRecipe({ userId: user.id })
  );

  const recipes = await findAll();

  expect(recipes[0]).toMatchObject(recipeNew);
  expect(recipes[1]).toMatchObject(recipeOld);
});
