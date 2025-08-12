import type { Database, Ingredients } from '@server/database';
import {
  ingredientsKeysPublic,
  type IngredientsPublic,
} from '@server/entities/ingredients';
import type { Insertable } from 'kysely';

const TABLE = 'ingredients';

export interface IngredientsRepository {
  create: (ingredient: Insertable<Ingredients>) => Promise<IngredientsPublic>;
  findById: (id: number) => Promise<IngredientsPublic | undefined>;
  findByName: (name: string) => Promise<IngredientsPublic | undefined>;
}

export function ingredientsRepository(
  database: Database
): IngredientsRepository {
  return {
    async create(ingredient) {
      return database
        .insertInto(TABLE)
        .values(ingredient)
        .returning(ingredientsKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async findById(id) {
      return database
        .selectFrom(TABLE)
        .select(ingredientsKeysPublic)
        .where('id', '=', id)
        .executeTakeFirst();
    },

    async findByName(name) {
      return database
        .selectFrom(TABLE)
        .select(ingredientsKeysPublic)
        .where('name', '=', name)
        .executeTakeFirst();
    },
  };
}
