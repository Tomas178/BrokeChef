import type { Database, SavedRecipes } from '@server/database';
import {
  savedRecipesKeysPublic,
  type SavedRecipesPublic,
} from '@server/entities/savedRecipes';
import { sql, type Insertable } from 'kysely';

const TABLE = 'savedRecipes';

export type SavedRecipesLink = Insertable<SavedRecipes>;

export interface SavedRecipesRepository {
  create: (link: SavedRecipesLink) => Promise<SavedRecipesPublic>;
  remove: (link: SavedRecipesLink) => Promise<SavedRecipesPublic>;
  isSaved: (link: SavedRecipesLink) => Promise<boolean>;
  getAverageUserEmbedding: (userId: string) => Promise<number[] | undefined>;
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

    async getAverageUserEmbedding(userId) {
      const result = await database
        .selectFrom(TABLE)
        .innerJoin('recipes', 'recipes.id', 'savedRecipes.recipeId')
        .select(sql<number[]>`AVG(recipes.embedding)`.as('avgEmbedding'))
        .where('savedRecipes.userId', '=', userId)
        .executeTakeFirst();

      if (!result || !result.avgEmbedding) {
        return;
      }

      return result.avgEmbedding;
    },
  };
}
