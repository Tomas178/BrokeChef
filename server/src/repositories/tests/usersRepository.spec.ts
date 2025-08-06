import { fakeUser } from '@server/entities/tests/fakes';
import { createTestDatabase } from '@tests/utils/database';
import { insertAll } from '@tests/utils/record';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { pick } from 'lodash-es';
import { usersKeysPublic } from '@server/entities/users';
import { usersRepository } from '../usersRepository';

const database = await wrapInRollbacks(createTestDatabase());
const repository = usersRepository(database);

const [user] = await insertAll(database, 'users', fakeUser());

describe('findById', () => {
  it('Should return a user', async () => {
    const userById = await repository.findById(user.id);

    expect(userById).toEqual({ ...pick(user, usersKeysPublic) });
  });

  it('Should return undefined if user is not found', async () => {
    const nonExistantId = user.id + 'a';

    await expect(repository.findById(nonExistantId)).resolves.toBeUndefined();
  });
});
