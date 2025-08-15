import type { Database, Ingredients } from '@server/database';
import {
  ingredientsKeysPublic,
  type IngredientsPublic,
} from '@server/entities/ingredients';
import type { Insertable } from 'kysely';

const TABLE = 'ingredients';

export interface IngredientsRepository {
  create: (
    ingredients: Insertable<Ingredients>[]
  ) => Promise<IngredientsPublic[]>;
  findById: (id: number) => Promise<IngredientsPublic | undefined>;
  findByNames: (names: string[]) => Promise<IngredientsPublic[]>;
}

export function ingredientsRepository(
  database: Database
): IngredientsRepository {
  return {
    async create(ingredients) {
      return database
        .insertInto(TABLE)
        .values(ingredients)
        .returning(ingredientsKeysPublic)
        .execute();
    },

    async findById(id) {
      return database
        .selectFrom(TABLE)
        .select(ingredientsKeysPublic)
        .where('id', '=', id)
        .executeTakeFirst();
    },

    async findByNames(names) {
      return database
        .selectFrom(TABLE)
        .select(ingredientsKeysPublic)
        .where('name', 'in', names)
        .execute();
    },
  };
}
