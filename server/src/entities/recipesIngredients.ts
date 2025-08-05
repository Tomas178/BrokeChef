import * as z from 'zod';
import type { RecipesIngredients } from '@server/database';
import type { Selectable } from 'kysely';
import { integerIdSchema } from './shared';

export const recipesIngredientsSchema = z.object({
  recipeId: integerIdSchema,
  ingredientId: integerIdSchema,
});

export const recipesIngredientsKeysAll = Object.keys(
  recipesIngredientsSchema.shape
) as (keyof RecipesIngredients)[];

export const recipesIngredientsKeysPublic = recipesIngredientsKeysAll;

export type recipesIngredientsPublic = Pick<
  Selectable<RecipesIngredients>,
  (typeof recipesIngredientsKeysPublic)[number]
>;
