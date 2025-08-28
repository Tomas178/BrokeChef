import * as z from 'zod';
import type { Selectable } from 'kysely';
import type { Ingredients } from '../database/types';
import { createdAtSchema, arrayStringSchema, integerIdSchema } from './shared';

export const ingredientsSchema = z.object({
  id: integerIdSchema,
  name: arrayStringSchema,
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

export type IngredientsName = Pick<IngredientsPublic, 'name'>['name'];
