import type { Database, DB, Recipes } from '@server/database';
import {
  recipesKeysPublic,
  type RecipesPublic,
} from '@server/entities/recipes';
import {
  usersKeysPublicWithoutId,
  type UsersPublicWithoutId,
} from '@server/entities/users';
import type { Pagination } from '@server/shared/pagination';
import RecipeNotFound from '@server/utils/errors/recipes/RecipeNotFound';
import { prefixTable } from '@server/utils/strings';
import type { AliasedRawBuilder, ExpressionBuilder, Insertable } from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/postgres';

const TABLE = 'recipes';

export interface RecipesRepository {
  create: (recipe: Insertable<Recipes>) => Promise<RecipesPublic>;
  findById: (id: number) => Promise<RecipesPublic | undefined>;
  findCreated: (
    userId: string,
    { offset, limit }: Pagination
  ) => Promise<RecipesPublic[]>;
  findSaved: (
    userId: string,
    { offset, limit }: Pagination
  ) => Promise<RecipesPublic[]>;
  findAll: ({ offset, limit }: Pagination) => Promise<RecipesPublic[]>;
  isAuthor: (recipeId: number, userId: string) => Promise<boolean>;
  remove: (id: number) => Promise<RecipesPublic>;
}

export function recipesRepository(database: Database): RecipesRepository {
  return {
    async create(recipe) {
      return database
        .insertInto(TABLE)
        .values(recipe)
        .returning(recipesKeysPublic)
        .returning(withAuthor)
        .executeTakeFirstOrThrow();
    },

    async findById(id: number): Promise<RecipesPublic | undefined> {
      return database
        .selectFrom(TABLE)
        .select(recipesKeysPublic)
        .select(withAuthor)
        .where('id', '=', id)
        .executeTakeFirst();
    },

    async findCreated(userId, { offset, limit }) {
      return database
        .selectFrom(TABLE)
        .select(recipesKeysPublic)
        .select(withAuthor)
        .where('userId', '=', userId)
        .orderBy('id', 'desc')
        .offset(offset)
        .limit(limit)
        .execute();
    },

    async findSaved(userId, { offset, limit }) {
      return database
        .selectFrom(TABLE)
        .innerJoin('savedRecipes', 'savedRecipes.recipeId', 'recipes.id')
        .select(prefixTable(TABLE, recipesKeysPublic))
        .select(withAuthor)
        .where('savedRecipes.userId', '=', userId)
        .orderBy('id', 'desc')
        .offset(offset)
        .limit(limit)
        .execute();
    },

    async findAll({ offset, limit }) {
      return database
        .selectFrom(TABLE)
        .select(recipesKeysPublic)
        .select(withAuthor)
        .orderBy('id', 'desc')
        .offset(offset)
        .limit(limit)
        .execute();
    },

    async isAuthor(recipeId, userId) {
      const recipe = await database
        .selectFrom(TABLE)
        .select('userId')
        .where('id', '=', recipeId)
        .executeTakeFirst();

      return recipe?.userId === userId;
    },

    async remove(id) {
      return database
        .deleteFrom(TABLE)
        .where('id', '=', id)
        .returning(recipesKeysPublic)
        .returning(withAuthor)
        .executeTakeFirstOrThrow(() => new RecipeNotFound(id));
    },
  };
}

function withAuthor(eb: ExpressionBuilder<DB, 'recipes'>) {
  return jsonObjectFrom(
    eb
      .selectFrom('users')
      .select(usersKeysPublicWithoutId)
      .whereRef('users.id', '=', 'recipes.userId')
  ).as('author') as AliasedRawBuilder<UsersPublicWithoutId, 'author'>;
}
