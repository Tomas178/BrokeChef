import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { createTestDatabase } from '@tests/utils/database';
import { insertAll } from '@tests/utils/record';
import { fakeUser } from '@server/entities/tests/fakes';
import { pick } from 'lodash-es';
import { usersKeysPublic } from '@server/entities/users';
import { authContext, requestContext } from '@tests/utils/context';
import usersRouter from '..';

const createCaller = createCallerFactory(usersRouter);
const database = await wrapInRollbacks(createTestDatabase());

const [user] = await insertAll(database, 'users', fakeUser());

const { findById } = createCaller(authContext({ database }, user));

it('Should return user when given userId', async () => {
  const userById = await findById(user.id);

  expect(userById).toEqual(pick(user, usersKeysPublic));
});

it('Should return user when not given userId but authenticanted', async () => {
  const userByAuth = await findById();

  expect(userByAuth).toEqual(pick(user, usersKeysPublic));
});

it('Should throw an error if user is not authenticated', async () => {
  const { findById } = createCaller(requestContext({ database }));

  await expect(findById()).rejects.toThrow(/unauthenticated/i);
});

it('Should throw an error if user is not found', async () => {
  const user = fakeUser();

  await expect(findById(user.id.replaceAll(/[a-z]/gi, 'a'))).rejects.toThrow(
    /not found/i
  );
});
