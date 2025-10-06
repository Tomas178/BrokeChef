import type { Database, Ratings } from '@server/database';
import {
  ratingsKeysPublic,
  type RatingsPublic,
  type Rating,
} from '@server/entities/ratings';
import type { Insertable } from 'kysely';

const TABLE = 'ratings';

export interface RatingsRepository {
  getUserRatingForRecipe: (recipeId: number, userId: string) => Promise<Rating>;
  create: (recipeToRate: Insertable<Ratings>) => Promise<RatingsPublic>;
  update: (recipeToUpdate: Insertable<Ratings>) => Promise<RatingsPublic>;
  remove: (recipeId: number, userId: string) => Promise<RatingsPublic>;
}

export function ratingsRepository(database: Database): RatingsRepository {
  return {
    async getUserRatingForRecipe(recipeId, userId) {
      const rating = await database
        .selectFrom(TABLE)
        .select('rating')
        .where('userId', '=', userId)
        .where('recipeId', '=', recipeId)
        .executeTakeFirst();

      return rating?.rating;
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
