import type { Database, RecipesIngredients } from '@server/database';
import {
  recipesIngredientsKeysPublic,
  type RecipesIngredientsPublic,
} from '@server/entities/recipesIngredients';
import type { Insertable } from 'kysely';

const TABLE = 'recipesIngredients';

export type RecipesIngredientsLink = Insertable<RecipesIngredients>;

export interface RecipesIngredientsRepository {
  create: (
    links: RecipesIngredientsLink[]
  ) => Promise<RecipesIngredientsPublic[]>;
  findByRecipeId: (
    recipeId: number
  ) => Promise<RecipesIngredientsPublic | undefined>;
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
