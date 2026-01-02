import type { Database, DB } from '@server/database';
import {
  recipesKeysPublic,
  type RecipesPublicAllInfo,
  type RecipesPublic,
} from '@server/entities/recipes';
import {
  usersKeysPublicWithoutId,
  type UsersPublicWithoutId,
} from '@server/entities/users';
import type { Pagination, PaginationWithSort } from '@server/shared/pagination';
import { prefixTable } from '@server/utils/strings';
import {
  type AliasedRawBuilder,
  type ExpressionBuilder,
  type OrderByDirection,
} from 'kysely';
import { jsonObjectFrom } from 'kysely/helpers/postgres';
import {
  SortingTypes,
  type SortingTypesValues,
} from '@server/enums/SortingTypes';
import pgvector, { cosineDistance } from 'pgvector/kysely';
import type { CreateRecipeData } from '@server/services/recipesService';
import { joinStepsToArray } from './utils/joinStepsToArray';

const TABLE = 'recipes';

export interface RecipesRepository {
  create: (recipe: CreateRecipeData) => Promise<RecipesPublic>;
  search: (
    vector: number[],
    { offset, limit }: Pagination
  ) => Promise<RecipesPublic[]>;
  findById: (id: number) => Promise<RecipesPublicAllInfo | undefined>;
  findCreatedByUser: (
    userId: string,
    { offset, limit }: Pagination
  ) => Promise<RecipesPublic[]>;
  totalCreatedByUser: (userId: string) => Promise<number>;
  findSavedByUser: (
    userId: string,
    { offset, limit }: Pagination
  ) => Promise<RecipesPublic[]>;
  totalSavedByUser: (userId: string) => Promise<number>;
  findByCollectionId: (collectionId: number) => Promise<RecipesPublic[]>;
  findAll: ({
    offset,
    limit,
    sort,
  }: PaginationWithSort) => Promise<RecipesPublic[]>;
  totalCount: () => Promise<number>;
  isAuthor: (recipeId: number, userId: string) => Promise<boolean>;
  remove: (id: number) => Promise<RecipesPublic>;
}

function normalizeRating<T extends { rating: number | string | null }>(
  recipe: T
): T {
  return {
    ...recipe,
    rating: recipe.rating ? Number(recipe.rating) : recipe.rating,
  };
}

export function recipesRepository(database: Database): RecipesRepository {
  return {
    async create(recipe) {
      const { embedding, ...rest } = recipe;

      return database
        .insertInto(TABLE)
        .values({
          ...rest,
          embedding: pgvector.toSql(embedding),
        })
        .returning(recipesKeysPublic)
        .returning(withAuthor)
        .returning(withRatings)
        .executeTakeFirstOrThrow();
    },

    async search(vector, { offset, limit }) {
      const recipes = await database
        .selectFrom(TABLE)
        .select(recipesKeysPublic)
        .select(withAuthor)
        .select(withRatings)
        .orderBy(cosineDistance('embedding', vector))
        .offset(offset)
        .limit(limit)
        .execute();

      return recipes.map(recipe => normalizeRating(recipe));
    },

    async findById(id) {
      const recipe = await database
        .selectFrom(TABLE)
        .select(recipesKeysPublic)
        .select(withAuthor)
        .select(withIngredients)
        .select(withTools)
        .select(withRatings)
        .where('id', '=', id)
        .executeTakeFirst();

      if (!recipe) return;

      return normalizeRating({
        ...recipe,
        steps: joinStepsToArray(recipe.steps),
        ingredients: recipe.ingredients ?? [],
        tools: recipe.tools ?? [],
      });
    },

    async findCreatedByUser(userId, { offset, limit }) {
      const recipes = await database
        .selectFrom(TABLE)
        .select(recipesKeysPublic)
        .select(withAuthor)
        .select(withRatings)
        .where('userId', '=', userId)
        .orderBy('id', 'desc')
        .offset(offset)
        .limit(limit)
        .execute();

      return recipes.map(recipe => normalizeRating(recipe));
    },

    async totalCreatedByUser(userId) {
      const { count } = await database
        .selectFrom(TABLE)
        .select(({ fn }) => fn.countAll().as('count'))
        .where('userId', '=', userId)
        .executeTakeFirstOrThrow();

      return Number(count);
    },

    async findSavedByUser(userId, { offset, limit }) {
      const recipes = await database
        .selectFrom(TABLE)
        .innerJoin('savedRecipes', 'savedRecipes.recipeId', 'recipes.id')
        .select(prefixTable(TABLE, recipesKeysPublic))
        .select(withAuthor)
        .select(withRatings)
        .where('savedRecipes.userId', '=', userId)
        .orderBy('id', 'desc')
        .offset(offset)
        .limit(limit)
        .execute();

      return recipes.map(recipe => normalizeRating(recipe));
    },

    async totalSavedByUser(userId) {
      const { count } = await database
        .selectFrom(TABLE)
        .innerJoin('savedRecipes', 'savedRecipes.recipeId', 'recipes.id')
        .select(({ fn }) => fn.countAll().as('count'))
        .where('savedRecipes.userId', '=', userId)
        .executeTakeFirstOrThrow();

      return Number(count);
    },

    async findByCollectionId(collectionId) {
      const recipes = await database
        .selectFrom(TABLE)
        .innerJoin(
          'collectionsRecipes',
          'collectionsRecipes.recipeId',
          'recipes.id'
        )
        .select(prefixTable(TABLE, recipesKeysPublic))
        .select(withAuthor)
        .select(withRatings)
        .where('collectionsRecipes.collectionId', '=', collectionId)
        .orderBy('recipes.id', 'desc')
        .execute();

      return recipes.map(recipe => normalizeRating(recipe));
    },

    async findAll({ offset, limit, sort }) {
      const orderByClause = convertSort(sort);

      const recipes = await database
        .selectFrom(TABLE)
        .select(recipesKeysPublic)
        .select(withAuthor)
        .select(withRatings)
        .orderBy(orderByClause.column, ob =>
          ob[orderByClause.direction === 'asc' ? 'asc' : 'desc']().nullsLast()
        )
        .offset(offset)
        .limit(limit)
        .execute();

      return recipes.map(recipe => normalizeRating(recipe) as RecipesPublic);
    },

    async totalCount() {
      const { count } = await database
        .selectFrom(TABLE)
        .select(eb => eb.fn.count('id').as('count'))
        .executeTakeFirstOrThrow();

      return Number(count);
    },

    async isAuthor(recipeId, userId) {
      const exists = await database
        .selectFrom(TABLE)
        .select('userId')
        .where('id', '=', recipeId)
        .where('userId', '=', userId)
        .executeTakeFirst();

      return !!exists;
    },

    async remove(id) {
      const recipe = await database
        .deleteFrom(TABLE)
        .where('id', '=', id)
        .returning(recipesKeysPublic)
        .returning(withAuthor)
        .returning(withRatings)
        .executeTakeFirstOrThrow();

      return normalizeRating(recipe);
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

export function withIngredients(eb: ExpressionBuilder<DB, 'recipes'>) {
  return eb
    .selectFrom('ingredients')
    .innerJoin(
      'recipesIngredients',
      'recipesIngredients.ingredientId',
      'ingredients.id'
    )
    .select(eb => eb.fn.jsonAgg('name').as('ingredients'))
    .whereRef('recipesIngredients.recipeId', '=', 'recipes.id')
    .as('ingredients') as unknown as AliasedRawBuilder<string[], 'ingredients'>;
}

export function withTools(eb: ExpressionBuilder<DB, 'recipes'>) {
  return eb
    .selectFrom('tools')
    .innerJoin('recipesTools', 'recipesTools.toolId', 'tools.id')
    .select(eb => eb.fn.jsonAgg('tools.name').as('tools'))
    .whereRef('recipesTools.recipeId', '=', 'recipes.id')
    .as('tools') as unknown as AliasedRawBuilder<string[], 'tools'>;
}

function withRatings(eb: ExpressionBuilder<DB, 'recipes'>) {
  return eb
    .selectFrom('ratings')
    .select(({ fn }) => fn.avg('rating').as('averageRating'))
    .whereRef('ratings.recipeId', '=', 'recipes.id')
    .as('rating') as unknown as AliasedRawBuilder<number, 'rating'>;
}

interface Order {
  column: 'rating' | 'id';
  direction: OrderByDirection;
}

function convertSort(sort: SortingTypesValues): Order {
  return sort === SortingTypes.HIGHEST_RATING
    ? { column: 'rating', direction: 'desc' }
    : sort === SortingTypes.LOWEST_RATING
      ? { column: 'rating', direction: 'asc' }
      : sort === SortingTypes.OLDEST
        ? { column: 'id', direction: 'asc' }
        : { column: 'id', direction: 'desc' };
}
