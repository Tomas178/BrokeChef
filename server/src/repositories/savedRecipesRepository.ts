import type { Database, SavedRecipes } from '@server/database';
import {
  savedRecipesKeysPublic,
  type savedRecipesPublic,
} from '@server/entities/savedRecipes';
import type { Insertable } from 'kysely';

const TABLE = 'savedRecipes';

interface SavedRecipesRepository {
  create: (
    recipeToSave: Insertable<SavedRecipes>
  ) => Promise<savedRecipesPublic>;
  remove: (recipeId: number, userId: string) => Promise<savedRecipesPublic>;
  isSaved: (recipeId: number, userId: string) => Promise<boolean>;
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

    async remove(recipeId, userId) {
      return database
        .deleteFrom(TABLE)
        .where('recipeId', '=', recipeId)
        .where('userId', '=', userId)
        .returning(savedRecipesKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async isSaved(recipeId, userId) {
      const exists = await database
        .selectFrom(TABLE)
        .select('userId')
        .where('recipeId', '=', recipeId)
        .where('userId', '=', userId)
        .executeTakeFirst();

      return !!exists;
    },
  };
}
