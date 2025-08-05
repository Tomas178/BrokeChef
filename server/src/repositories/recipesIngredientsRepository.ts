import type { Database, RecipesIngredients } from '@server/database';
import {
  recipesIngredientsKeysPublic,
  type recipesIngredientsPublic,
} from '@server/entities/recipesIngredients';
import type { Insertable } from 'kysely';

const TABLE = 'recipesIngredients';

export function recipesIngredientsRepository(database: Database) {
  return {
    async create(
      link: Insertable<RecipesIngredients>
    ): Promise<recipesIngredientsPublic> {
      return database
        .insertInto(TABLE)
        .values(link)
        .returning(recipesIngredientsKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async findByRecipeId(
      recipeId: number
    ): Promise<recipesIngredientsPublic | undefined> {
      return database
        .selectFrom(TABLE)
        .select(recipesIngredientsKeysPublic)
        .where('recipeId', '=', recipeId)
        .executeTakeFirst();
    },
  };
}
