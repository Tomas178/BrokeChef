import type { Collections, Database } from '@server/database';
import {
  collectionsKeysPublic,
  type CollectionsPublic,
} from '@server/entities/collections';
import type { Insertable } from 'kysely';

const TABLE = 'collections';

export type RowInsert = Insertable<Collections>;

export interface CollectionsRepository {
  create: (collection: RowInsert) => Promise<CollectionsPublic>;
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
