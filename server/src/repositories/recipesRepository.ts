import type { Database, DB, Recipes } from '@server/database';
import {
  recipesKeysPublic,
  type RecipesPublic,
} from '@server/entities/recipes';
import { usersKeysPublic, type UsersPublic } from '@server/entities/users';
import type { Pagination } from '@server/shared/types';
import type { AliasedRawBuilder, ExpressionBuilder, Insertable } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/postgres';

const TABLE = 'recipes';

export function recipesRepository(db: Database) {
  return {
    async create(recipe: Insertable<Recipes>): Promise<RecipesPublic> {
      return db
        .insertInto(TABLE)
        .values(recipe)
        .returning(recipesKeysPublic)
        .returning(withAuthor)
        .executeTakeFirstOrThrow();
    },

    async findById(id: number): Promise<RecipesPublic | undefined> {
      return db
        .selectFrom(TABLE)
        .select(recipesKeysPublic)
        .select(withAuthor)
        .where('id', '=', id)
        .executeTakeFirst();
    },

    async findCreated(
      userId: string,
      { offset, limit }: Pagination
    ): Promise<RecipesPublic[]> {
      return db
        .selectFrom(TABLE)
        .select(recipesKeysPublic)
        .select(withAuthor)
        .where('userId', '=', userId)
        .orderBy('id', 'desc')
        .offset(offset)
        .limit(limit)
        .execute();
    },

    async findAll({ offset, limit }: Pagination): Promise<RecipesPublic[]> {
      return db
        .selectFrom(TABLE)
        .select(recipesKeysPublic)
        .select(withAuthor)
        .orderBy('id', 'desc')
        .offset(offset)
        .limit(limit)
        .execute();
    },

    async remove(id: number): Promise<RecipesPublic> {
      return db
        .deleteFrom(TABLE)
        .where('id', '=', id)
        .returning(recipesKeysPublic)
        .returning(withAuthor)
        .executeTakeFirstOrThrow();
    },
  };
}

function withAuthor(eb: ExpressionBuilder<DB, 'recipes'>) {
  return jsonObjectFrom(
    eb
      .selectFrom('users')
      .select(usersKeysPublic)
      .whereRef('users.id', '=', 'recipes.userId')
  ).as('author') as AliasedRawBuilder<UsersPublic, 'author'>;
}
