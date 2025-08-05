import { createCallerFactory } from '@server/trpc';
import recipesRouter from '..';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { clearTables, insertAll } from '@tests/utils/record';
import { fakeRecipe, fakeUser } from '@server/entities/tests/fakes';

const createCaller = createCallerFactory(recipesRouter);
const db = await wrapInRollbacks(createTestDatabase());

await clearTables(db, ['recipes']);
const [userOne, userTwo] = await insertAll(db, 'users', [
  fakeUser(),
  fakeUser(),
]);

const { findByUserId } = createCaller({ db });

it('Should return an empty list if there are no recipes created by user', async () => {
  expect(await findByUserId({ userId: userOne.id })).toHaveLength(0);
});

it('Should return a list of recipes', async () => {
  await insertAll(db, 'recipes', fakeRecipe({ userId: userOne.id }));

  const recipes = await findByUserId({ userId: userOne.id });

  expect(recipes).toHaveLength(1);
});

it('Should return the latest recipes first', async () => {
  const [recipeOld] = await insertAll(
    db,
    'recipes',
    fakeRecipe({ userId: userOne.id })
  );

  const [recipeNew] = await insertAll(
    db,
    'recipes',
    fakeRecipe({ userId: userOne.id })
  );

  const recipes = await findByUserId({ userId: userOne.id });

  expect(recipes[0]).toMatchObject(recipeNew);
  expect(recipes[1]).toMatchObject(recipeOld);
});
