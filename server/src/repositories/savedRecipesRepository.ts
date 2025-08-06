import type { Database, SavedRecipes } from '@server/database';
import {
  savedRecipesKeysPublic,
  type savedRecipesPublic,
} from '@server/entities/savedRecipes';
import type { Insertable } from 'kysely';

const TABLE = 'savedRecipes';

export function savedRecipesRepository(database: Database) {
  return {
    async create(
      recipeToSave: Insertable<SavedRecipes>
    ): Promise<savedRecipesPublic> {
      return database
        .insertInto(TABLE)
        .values(recipeToSave)
        .returning(savedRecipesKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async remove(
      recipeId: number,
      userId: string
    ): Promise<savedRecipesPublic> {
      return database
        .deleteFrom(TABLE)
        .where('recipeId', '=', recipeId)
        .where('userId', '=', userId)
        .returning(savedRecipesKeysPublic)
        .executeTakeFirstOrThrow();
    },
  };
}
