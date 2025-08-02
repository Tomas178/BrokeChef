import type { Database, DB, Recipes } from '@server/database';
import {
  recipesKeysPublic,
  type RecipesPublic,
} from '@server/entities/recipes';
import { usersKeysPublic, type UsersPublic } from '@server/entities/users';
import type { AliasedRawBuilder, ExpressionBuilder, Insertable } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/postgres';

const TABLE = 'recipes';

type Pagination = {
  limit: number;
  offset: number;
};

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

    async findById(RecipeId: number): Promise<RecipesPublic | undefined> {
      return db
        .selectFrom(TABLE)
        .select(recipesKeysPublic)
        .select(withAuthor)
        .where('id', '=', RecipeId)
        .executeTakeFirst();
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
