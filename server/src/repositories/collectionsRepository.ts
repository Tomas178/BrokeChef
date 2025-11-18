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
  findByUserId: (userId: string) => Promise<CollectionsPublic[]>;
  totalCollectionsByUser: (userId: string) => Promise<number>;
  isAuthor: (collectionId: number, userId: string) => Promise<boolean>;
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

    async findByUserId(userId) {
      return database
        .selectFrom(TABLE)
        .select(collectionsKeysPublic)
        .where('userId', '=', userId)
        .execute();
    },

    async totalCollectionsByUser(userId) {
      const { count } = await database
        .selectFrom(TABLE)
        .select(({ fn }) => fn.countAll().as('count'))
        .where('userId', '=', userId)
        .executeTakeFirstOrThrow();

      return Number(count);
    },

    async isAuthor(collectionId, userId) {
      const exists = await database
        .selectFrom(TABLE)
        .select('userId')
        .where('userId', '=', userId)
        .where('id', '=', collectionId)
        .executeTakeFirst();

      return !!exists;
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
