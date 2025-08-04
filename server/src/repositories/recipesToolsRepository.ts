import type { Database, RecipesTools } from '@server/database';
import { recipesToolsPublic } from '@server/entities/recipesTools';
import type { Insertable } from 'kysely';

const TABLE = 'recipesTools';

export function recipesToolsRepository(db: Database) {
  return {
    async create(link: Insertable<RecipesTools>): Promise<recipesToolsPublic> {
      return db
        .insertInto(TABLE)
        .values(link)
        .returning(recipesToolsPublic)
        .executeTakeFirstOrThrow();
    },

    async findByRecipeId(
      recipeId: number
    ): Promise<recipesToolsPublic | undefined> {
      return db
        .selectFrom(TABLE)
        .select(recipesToolsPublic)
        .where('recipeId', '=', recipeId)
        .executeTakeFirst();
    },
  };
}
