import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { insertAll } from '@tests/utils/record';
import { fakeUser } from '@server/entities/tests/fakes';
import { pick } from 'lodash-es';
import { usersKeysPublic } from '@server/entities/users';
import usersRouter from '..';

const createCaller = createCallerFactory(usersRouter);
const database = await wrapInRollbacks(createTestDatabase());

const [user] = await insertAll(database, 'users', fakeUser());

const { findById } = createCaller({ db: database });

it('Should return user', async () => {
  const userById = await findById(user.id);

  expect(userById).toEqual(pick(user, usersKeysPublic));
});

it('Should throw an error if user is not found', async () => {
  const user = fakeUser();

  await expect(findById(user.id.replaceAll(/[a-z]/gi, 'a'))).rejects.toThrow(
    /not found/i
  );
});
