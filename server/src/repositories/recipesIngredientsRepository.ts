import type { Database, RecipesIngredients } from '@server/database';
import {
  recipesIngredientsKeysPublic,
  type recipesIngredientsPublic,
} from '@server/entities/recipesIngredients';
import type { Insertable } from 'kysely';

const TABLE = 'recipesIngredients';

export interface RecipesIngredientsRepository {
  create: (
    link: Insertable<RecipesIngredients>
  ) => Promise<recipesIngredientsPublic>;
  findByRecipeId: (
    recipeId: number
  ) => Promise<recipesIngredientsPublic | undefined>;
}

export function recipesIngredientsRepository(
  database: Database
): RecipesIngredientsRepository {
  return {
    async create(link) {
      return database
        .insertInto(TABLE)
        .values(link)
        .returning(recipesIngredientsKeysPublic)
        .executeTakeFirstOrThrow();
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
