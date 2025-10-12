import type { Database, RecipesTools } from '@server/database';
import {
  recipesToolsKeysPublic,
  type recipesToolsPublic,
} from '@server/entities/recipesTools';
import type { Insertable } from 'kysely';

const TABLE = 'recipesTools';

export type RecipesToolsLink = Insertable<RecipesTools>;

export interface RecipesToolsRepository {
  create: (links: RecipesToolsLink[]) => Promise<recipesToolsPublic[]>;
  findByRecipeId: (recipeId: number) => Promise<recipesToolsPublic | undefined>;
}

export function recipesToolsRepository(
  database: Database
): RecipesToolsRepository {
  return {
    async create(links) {
      return database
        .insertInto(TABLE)
        .values(links)
        .returning(recipesToolsKeysPublic)
        .execute();
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
