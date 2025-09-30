import type { Database, Ratings } from '@server/database';
import {
  ratingsKeysPublic,
  type RatingsPublic,
} from '@server/entities/ratings';
import type { Insertable } from 'kysely';

const TABLE = 'ratings';

export interface RatingsRepository {
  getUserRatingForRecipe: (
    recipeId: number,
    userId: string
  ) => Promise<number | undefined>;
  getRecipeRating: (recipeId: number) => Promise<number | undefined>;
  getRecipeRatingsBatch: (recipeIds: number[]) => Promise<number[]>;
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

    async getRecipeRating(recipeId) {
      const [rating] = await this.getRecipeRatingsBatch([recipeId]);
      return rating;
    },

    async getRecipeRatingsBatch(recipeIds) {
      const result = await database
        .selectFrom(TABLE)
        .select(['recipeId', ({ fn }) => fn.avg('rating').as('rating')])
        .where('recipeId', 'in', recipeIds)
        .groupBy('recipeId')
        .execute();

      const ratingsMap = new Map(
        result.map(r => [r.recipeId, Number(r.rating)])
      );

      return recipeIds.map(id => ratingsMap.get(id) ?? 0);
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
