import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { insertAll } from '@tests/utils/record';
import {
  fakeRecipe,
  fakeSavedRecipe,
  fakeUser,
} from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/context';
import usersRouter from '..';

const createCaller = createCallerFactory(usersRouter);
const database = await wrapInRollbacks(createTestDatabase());

const [user] = await insertAll(database, 'users', fakeUser());

const { totalSaved } = createCaller(authContext({ database }, user));

it('Should throw an error if user is not authenticated', async () => {
  const { totalSaved } = createCaller(requestContext({ database }));

  await expect(totalSaved()).rejects.toThrow(/unauthenticated/i);
});

it('Should return 0', async () => {
  await expect(totalSaved()).resolves.toBe(0);
});

it('Should return the same number that was saved', async () => {
  const created = await insertAll(database, 'recipes', [
    fakeRecipe({ userId: user.id }),
    fakeRecipe({ userId: user.id }),
  ]);

  const saved = await insertAll(database, 'savedRecipes', [
    fakeSavedRecipe({ recipeId: created[0].id, userId: user.id }),
    fakeSavedRecipe({ recipeId: created[1].id, userId: user.id }),
  ]);

  await expect(totalSaved()).resolves.toBe(saved.length);
});
