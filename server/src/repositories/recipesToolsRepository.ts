import type { Database, RecipesTools } from '@server/database';
import {
  recipesToolsKeysPublic,
  type recipesToolsPublic,
} from '@server/entities/recipesTools';
import type { Insertable } from 'kysely';

const TABLE = 'recipesTools';

export function recipesToolsRepository(database: Database) {
  return {
    async create(link: Insertable<RecipesTools>): Promise<recipesToolsPublic> {
      return database
        .insertInto(TABLE)
        .values(link)
        .returning(recipesToolsKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async findByRecipeId(
      recipeId: number
    ): Promise<recipesToolsPublic | undefined> {
      return database
        .selectFrom(TABLE)
        .select(recipesToolsKeysPublic)
        .where('recipeId', '=', recipeId)
        .executeTakeFirst();
    },
  };
}
