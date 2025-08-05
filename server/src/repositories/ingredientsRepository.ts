import type { Database, Ingredients } from '@server/database';
import {
  ingredientsKeysPublic,
  type IngredientsPublic,
} from '@server/entities/ingredients';
import type { Insertable } from 'kysely';

const TABLE = 'ingredients';

export function ingredientsRepository(db: Database) {
  return {
    async create(
      ingredient: Insertable<Ingredients>
    ): Promise<IngredientsPublic> {
      return db
        .insertInto(TABLE)
        .values(ingredient)
        .returning(ingredientsKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async findById(id: number): Promise<IngredientsPublic | undefined> {
      return db
        .selectFrom(TABLE)
        .select(ingredientsKeysPublic)
        .where('id', '=', id)
        .executeTakeFirst();
    },

    async findByName(name: string): Promise<IngredientsPublic | undefined> {
      return db
        .selectFrom(TABLE)
        .select(ingredientsKeysPublic)
        .where('name', '=', name)
        .executeTakeFirst();
    },
  };
}
