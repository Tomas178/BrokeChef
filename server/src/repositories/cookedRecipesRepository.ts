import type { CookedRecipes, Database } from '@server/database';
import { cookedRecipesPublic } from '@server/entities/cookedRecipes';
import type { Insertable } from 'kysely';

const TABLE = 'cookedRecipes';

export type CookedRecipesLink = Insertable<CookedRecipes>;

export interface CookedRecipesRepository {
  create: (link: CookedRecipesLink) => Promise<cookedRecipesPublic>;
  remove: (link: CookedRecipesLink) => Promise<cookedRecipesPublic>;
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
        .returning(cookedRecipesPublic)
        .executeTakeFirstOrThrow();
    },

    async remove(link) {
      return database
        .deleteFrom(TABLE)
        .where('userId', '=', link.userId)
        .where('recipeId', '=', link.recipeId)
        .returning(cookedRecipesPublic)
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
