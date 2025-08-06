import type { Database, Ingredients } from '@server/database';
import {
  ingredientsKeysPublic,
  type IngredientsPublic,
} from '@server/entities/ingredients';
import type { Insertable } from 'kysely';

const TABLE = 'ingredients';

export function ingredientsRepository(database: Database) {
  return {
    async create(
      ingredient: Insertable<Ingredients>
    ): Promise<IngredientsPublic> {
      return database
        .insertInto(TABLE)
        .values(ingredient)
        .returning(ingredientsKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async findById(id: number): Promise<IngredientsPublic | undefined> {
      return database
        .selectFrom(TABLE)
        .select(ingredientsKeysPublic)
        .where('id', '=', id)
        .executeTakeFirst();
    },

    async findByName(name: string): Promise<IngredientsPublic | undefined> {
      return database
        .selectFrom(TABLE)
        .select(ingredientsKeysPublic)
        .where('name', '=', name)
        .executeTakeFirst();
    },
  };
}
