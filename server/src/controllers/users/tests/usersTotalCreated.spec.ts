import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { insertAll } from '@tests/utils/record';
import { fakeRecipe, fakeUser } from '@server/entities/tests/fakes';
import { authContext, requestContext } from '@tests/utils/callers';
import usersRouter from '..';

const createCaller = createCallerFactory(usersRouter);
const database = await wrapInRollbacks(createTestDatabase());

const [user] = await insertAll(database, 'users', fakeUser());

const { totalCreated } = createCaller(authContext({ database }, user));

it('Should throw an error if user is not authenticated', async () => {
  const { totalCreated } = createCaller(requestContext({ database }));

  await expect(totalCreated()).rejects.toThrow(/unauthenticated/i);
});

it('Should return 0', async () => {
  await expect(totalCreated()).resolves.toBe(0);
});

it('Should return the same number that was created', async () => {
  const created = await insertAll(database, 'recipes', [
    fakeRecipe({ userId: user.id }),
    fakeRecipe({ userId: user.id }),
  ]);

  await expect(totalCreated()).resolves.toBe(created.length);
});
