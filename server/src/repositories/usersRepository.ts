import type { Database } from '@server/database';
import { usersKeysPublic, type UsersPublic } from '@server/entities/users';
import UserNotFound from '@server/utils/errors/users/UserNotFound';

const TABLE = 'users';

export interface UsersRepository {
  findById: (id: string) => Promise<UsersPublic>;
  updateImage: (id: string, image: string) => Promise<string>;
}

export function usersRepository(database: Database): UsersRepository {
  return {
    async findById(id) {
      return database
        .selectFrom(TABLE)
        .select(usersKeysPublic)
        .where('id', '=', id)
        .executeTakeFirstOrThrow(() => new UserNotFound());
    },

    async updateImage(id, image) {
      const updated = await database
        .updateTable(TABLE)
        .set({ image })
        .where('id', '=', id)
        .returning('image')
        .executeTakeFirstOrThrow(() => new UserNotFound());

      return updated.image!;
    },
  };
}
