import type { Database } from '@server/database';
import { usersKeysPublic, type UsersPublic } from '@server/entities/users';

const TABLE = 'users';

export function usersRepository(database: Database) {
  return {
    async findById(id: string): Promise<UsersPublic | undefined> {
      return database
        .selectFrom(TABLE)
        .select(usersKeysPublic)
        .where('id', '=', id)
        .executeTakeFirst();
    },
  };
}
