import type { Database } from '@server/database';
import { usersKeysPublic, type UsersPublic } from '@server/entities/users';
import UserNotFound from '@server/utils/errors/users/UserNotFound';

const TABLE = 'users';

interface UsersRepository {
  findById: (id: string) => Promise<UsersPublic>;
}

export function usersRepository(database: Database): UsersRepository {
  return {
    async findById(id) {
      return database
        .selectFrom(TABLE)
        .select(usersKeysPublic)
        .where('id', '=', id)
        .executeTakeFirstOrThrow(() => new UserNotFound(id));
    },
  };
}
