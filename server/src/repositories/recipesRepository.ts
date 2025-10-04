import type { Database, DB, Recipes } from '@server/database';
import {
  recipesKeysPublic,
  type RecipesPublicWithoutRating,
  type RecipesPublicAllInfo,
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
import { joinStepsToArray } from './utils/joinStepsToArray';

const TABLE = 'recipes';

export interface RecipesRepository {
  create: (recipe: Insertable<Recipes>) => Promise<RecipesPublic>;
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
  findAll: ({
    offset,
    limit,
  }: Pagination) => Promise<RecipesPublicWithoutRating[]>;
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
      return database
        .insertInto(TABLE)
        .values(recipe)
        .returning(recipesKeysPublic)
        .returning(withAuthor)
        .returning(withRatings)
        .executeTakeFirstOrThrow();
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
        .executeTakeFirstOrThrow(() => new RecipeNotFound());

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

function withIngredients(eb: ExpressionBuilder<DB, 'recipes'>) {
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

function withTools(eb: ExpressionBuilder<DB, 'recipes'>) {
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
