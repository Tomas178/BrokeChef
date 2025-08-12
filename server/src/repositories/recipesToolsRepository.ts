import type { Database, RecipesTools } from '@server/database';
import {
  recipesToolsKeysPublic,
  type recipesToolsPublic,
} from '@server/entities/recipesTools';
import type { Insertable } from 'kysely';

const TABLE = 'recipesTools';

interface RecipesToolsRepository {
  create: (link: Insertable<RecipesTools>) => Promise<recipesToolsPublic>;
  findByRecipeId: (recipeId: number) => Promise<recipesToolsPublic | undefined>;
}

export function recipesToolsRepository(
  database: Database
): RecipesToolsRepository {
  return {
    async create(link) {
      return database
        .insertInto(TABLE)
        .values(link)
        .returning(recipesToolsKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async findByRecipeId(recipeId) {
      return database
        .selectFrom(TABLE)
        .select(recipesToolsKeysPublic)
        .where('recipeId', '=', recipeId)
        .executeTakeFirst();
    },
  };
}
