import type { Collections, Database } from '@server/database';
import {
  collectionsKeysPublic,
  type CollectionsPublic,
} from '@server/entities/collections';
import type { Insertable } from 'kysely';

const TABLE = 'collections';

export interface CollectionsRepository {
  create: (collection: Insertable<Collections>) => Promise<CollectionsPublic>;
  findById: (id: number) => Promise<CollectionsPublic | undefined>;
  totalCollectionsByUser: (userId: string) => Promise<number>;
  remove: (id: number) => Promise<CollectionsPublic>;
}

export function collectionsRepository(
  database: Database
): CollectionsRepository {
  return {
    async create(collection) {
      return database
        .insertInto(TABLE)
        .values(collection)
        .returning(collectionsKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async findById(id) {
      return database
        .selectFrom(TABLE)
        .select(collectionsKeysPublic)
        .where('id', '=', id)
        .executeTakeFirst();
    },

    async totalCollectionsByUser(userId) {
      const { count } = await database
        .selectFrom(TABLE)
        .select(({ fn }) => fn.countAll().as('count'))
        .where('userId', '=', userId)
        .executeTakeFirstOrThrow();

      return Number(count);
    },

    async remove(id) {
      return database
        .deleteFrom(TABLE)
        .where('id', '=', id)
        .returning(collectionsKeysPublic)
        .executeTakeFirstOrThrow();
    },
  };
}
