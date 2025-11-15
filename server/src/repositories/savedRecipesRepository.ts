import type { Database, SavedRecipes } from '@server/database';
import {
  savedRecipesKeysPublic,
  type SavedRecipesPublic,
} from '@server/entities/savedRecipes';
import type { Insertable } from 'kysely';

const TABLE = 'savedRecipes';

export type SavedRecipesLink = Insertable<SavedRecipes>;

export interface SavedRecipesRepository {
  create: (link: SavedRecipesLink) => Promise<SavedRecipesPublic>;
  remove: (link: SavedRecipesLink) => Promise<SavedRecipesPublic>;
  isSaved: (link: SavedRecipesLink) => Promise<boolean>;
}

export function savedRecipesRepository(
  database: Database
): SavedRecipesRepository {
  return {
    async create(recipeToSave) {
      return database
        .insertInto(TABLE)
        .values(recipeToSave)
        .returning(savedRecipesKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async remove(link) {
      return database
        .deleteFrom(TABLE)
        .where('recipeId', '=', link.recipeId)
        .where('userId', '=', link.userId)
        .returning(savedRecipesKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async isSaved(link) {
      const exists = await database
        .selectFrom(TABLE)
        .select('userId')
        .where('recipeId', '=', link.recipeId)
        .where('userId', '=', link.userId)
        .executeTakeFirst();

      return !!exists;
    },
  };
}
