import type { Database, Ratings } from '@server/database';
import {
  ratingsKeysPublic,
  type ratingsPublic,
} from '@server/entities/ratings';
import type { Insertable } from 'kysely';

const TABLE = 'ratings';

export interface RatingsRepository {
  create: (ratedRecipe: Insertable<Ratings>) => Promise<ratingsPublic>;
  remove: (recipeId: number, userId: string) => Promise<ratingsPublic>;
}

export function ratingsRepository(database: Database): RatingsRepository {
  return {
    async create(ratedRecipe) {
      return database
        .insertInto(TABLE)
        .values(ratedRecipe)
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
