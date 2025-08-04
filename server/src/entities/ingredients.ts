import z from 'zod';
import {
  createdAtSchema,
  ingredientToolNameSchema,
  integerIdSchema,
} from './shared';
import type { Ingredients } from '../database/types';
import type { Selectable } from 'kysely';

export const ingredientsSchema = z.object({
  id: integerIdSchema,
  name: ingredientToolNameSchema,
  createdAt: createdAtSchema,
});

export const ingredientsKeysAll = Object.keys(
  ingredientsSchema.shape
) as (keyof Ingredients)[];

export const ingredientsKeysPublic = ingredientsKeysAll;
export type IngredientsPublic = Pick<
  Selectable<Ingredients>,
  (typeof ingredientsKeysPublic)[number]
>;
