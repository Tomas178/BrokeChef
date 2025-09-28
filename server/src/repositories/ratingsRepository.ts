import type { Database, Ratings } from '@server/database';
import {
  ratingsKeysPublic,
  type ratingsPublic,
} from '@server/entities/ratings';
import type { Insertable } from 'kysely';

const TABLE = 'ratings';

export interface RatingsRepository {
  create: (recipeToRate: Insertable<Ratings>) => Promise<ratingsPublic>;
  update: (recipeToUpdate: Insertable<Ratings>) => Promise<ratingsPublic>;
  remove: (recipeId: number, userId: string) => Promise<ratingsPublic>;
}

export function ratingsRepository(database: Database): RatingsRepository {
  return {
    async create(recipeToRate) {
      return database
        .insertInto(TABLE)
        .values(recipeToRate)
        .returning(ratingsKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async update({ userId, recipeId, rating }) {
      return database
        .updateTable(TABLE)
        .set({ rating })
        .where('userId', '=', userId)
        .where('recipeId', '=', recipeId)
        .returning(ratingsKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async remove(recipeId, userId) {
      return database
        .deleteFrom(TABLE)
        .where('userId', '=', userId)
        .where('recipeId', '=', recipeId)
        .returning(ratingsKeysPublic)
        .executeTakeFirstOrThrow();
    },
  };
}
