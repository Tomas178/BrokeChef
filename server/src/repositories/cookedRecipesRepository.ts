import type { CookedRecipes, Database } from '@server/database';
import {
  cookedRecipesKeysPublic,
  type CookedRecipesPublic,
} from '@server/entities/cookedRecipes';
import type { Insertable } from 'kysely';

const TABLE = 'cookedRecipes';

export type CookedRecipesLink = Insertable<CookedRecipes>;

export interface CookedRecipesRepository {
  create: (link: CookedRecipesLink) => Promise<CookedRecipesPublic>;
  remove: (link: CookedRecipesLink) => Promise<CookedRecipesPublic>;
  isCooked: (link: CookedRecipesLink) => Promise<boolean>;
}

export function cookedRecipesRepository(
  database: Database
): CookedRecipesRepository {
  return {
    async create(link) {
      return database
        .insertInto(TABLE)
        .values(link)
        .returning(cookedRecipesKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async remove(link) {
      return database
        .deleteFrom(TABLE)
        .where('userId', '=', link.userId)
        .where('recipeId', '=', link.recipeId)
        .returning(cookedRecipesKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async isCooked(link) {
      const exists = await database
        .selectFrom(TABLE)
        .select('userId')
        .where('userId', '=', link.userId)
        .where('recipeId', '=', link.recipeId)
        .executeTakeFirst();

      return !!exists;
    },
  };
}
