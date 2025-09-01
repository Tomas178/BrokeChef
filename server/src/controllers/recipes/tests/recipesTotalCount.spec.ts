import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { clearTables, insertAll } from '@tests/utils/record';
import { fakeRecipe, fakeUser } from '@server/entities/tests/fakes';
import recipesRouter from '..';

const createCaller = createCallerFactory(recipesRouter);
const database = await wrapInRollbacks(createTestDatabase());

await clearTables(database, ['users', 'recipes']);

const [user] = await insertAll(database, 'users', fakeUser());
const userId = user.id;

const { totalCount } = createCaller({ db: database });

it('Should return zero when there are no records in database', async () => {
  await expect(totalCount()).resolves.toBe(0);
});

it('Should return correct answer when there are records in database', async () => {
  const recipes = await insertAll(database, 'recipes', [
    fakeRecipe({ userId }),
    fakeRecipe({ userId }),
    fakeRecipe({ userId }),
  ]);

  await expect(totalCount()).resolves.toBe(recipes.length);
});
