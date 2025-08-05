import type { Database, SavedRecipes } from '@server/database';
import {
  savedRecipesKeysPublic,
  type savedRecipesPublic,
} from '@server/entities/savedRecipes';
import type { Pagination } from '@server/shared/types';
import type { Insertable } from 'kysely';

const TABLE = 'savedRecipes';

export function savedRecipesRepository(db: Database) {
  return {
    async create(
      recipeToSave: Insertable<SavedRecipes>
    ): Promise<savedRecipesPublic> {
      return db
        .insertInto(TABLE)
        .values(recipeToSave)
        .returning(savedRecipesKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async remove(recipeId: number): Promise<savedRecipesPublic> {
      return db
        .deleteFrom(TABLE)
        .where('recipeId', '=', recipeId)
        .returning(savedRecipesKeysPublic)
        .executeTakeFirstOrThrow();
    },
  };
}
