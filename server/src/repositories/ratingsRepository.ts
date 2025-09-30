import type { Database, Ratings } from '@server/database';
import {
  ratingsKeysPublic,
  type RatingsPublic,
} from '@server/entities/ratings';
import type { Insertable } from 'kysely';

const TABLE = 'ratings';

export interface RatingsRepository {
  getUserRating: (
    recipeId: number,
    userId: string
  ) => Promise<RatingsPublic | undefined>;
  getRecipeRating: (recipeId: number) => Promise<number | undefined>;
  create: (recipeToRate: Insertable<Ratings>) => Promise<RatingsPublic>;
  update: (recipeToUpdate: Insertable<Ratings>) => Promise<RatingsPublic>;
  remove: (recipeId: number, userId: string) => Promise<RatingsPublic>;
}

export function ratingsRepository(database: Database): RatingsRepository {
  return {
    async getUserRating(recipeId, userId) {
      return database
        .selectFrom(TABLE)
        .select(ratingsKeysPublic)
        .where('userId', '=', userId)
        .where('recipeId', '=', recipeId)
        .executeTakeFirst();
    },

    async getRecipeRating(recipeId) {
      const result = await database
        .selectFrom(TABLE)
        .select(({ fn }) => fn.avg('rating').as('rating'))
        .where('recipeId', '=', recipeId)
        .groupBy('recipeId')
        .executeTakeFirst();

      return result ? Number(result.rating) : undefined;
    },

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
