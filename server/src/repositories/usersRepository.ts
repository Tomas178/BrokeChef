import type { Database } from '@server/database';
import { usersKeysPublic, type UsersPublic } from '@server/entities/users';

const TABLE = 'users';

interface UsersRepository {
  findById: (id: string) => Promise<UsersPublic | undefined>;
}

export function usersRepository(database: Database): UsersRepository {
  return {
    async findById(id) {
      return database
        .selectFrom(TABLE)
        .select(usersKeysPublic)
        .where('id', '=', id)
        .executeTakeFirst();
    },
  };
}
