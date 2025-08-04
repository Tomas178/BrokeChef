import type { Database, RecipesIngredients } from '@server/database';
import {
  recipesIngredientsKeysPublic,
  type recipesIngredientsPublic,
} from '@server/entities/recipesIngredients';
import type { Insertable } from 'kysely';

const TABLE = 'recipesIngredients';

export function recipesIngredientsRepository(db: Database) {
  return {
    async create(
      link: Insertable<RecipesIngredients>
    ): Promise<recipesIngredientsPublic> {
      return db
        .insertInto(TABLE)
        .values(link)
        .returning(recipesIngredientsKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async findByRecipeId(
      recipeId: number
    ): Promise<recipesIngredientsPublic | undefined> {
      return db
        .selectFrom(TABLE)
        .select(recipesIngredientsKeysPublic)
        .where('recipeId', '=', recipeId)
        .executeTakeFirst();
    },
  };
}
