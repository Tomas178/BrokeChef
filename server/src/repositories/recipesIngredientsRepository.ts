import type { Database, RecipesIngredients } from '@server/database';
import {
  recipesIngredientsKeysPublic,
  type recipesIngredientsPublic,
} from '@server/entities/recipesIngredients';
import type { Insertable } from 'kysely';

const TABLE = 'recipesIngredients';

export interface RecipesIngredientsRepository {
  create: (
    links: Insertable<RecipesIngredients>[]
  ) => Promise<recipesIngredientsPublic[]>;
  findByRecipeId: (
    recipeId: number
  ) => Promise<recipesIngredientsPublic | undefined>;
}

export function recipesIngredientsRepository(
  database: Database
): RecipesIngredientsRepository {
  return {
    async create(links) {
      return database
        .insertInto(TABLE)
        .values(links)
        .returning(recipesIngredientsKeysPublic)
        .execute();
    },

    async findByRecipeId(recipeId) {
      return database
        .selectFrom(TABLE)
        .select(recipesIngredientsKeysPublic)
        .where('recipeId', '=', recipeId)
        .executeTakeFirst();
    },
  };
}
