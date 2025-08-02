import z from 'zod';
import {
  createdAtSchema,
  integerIdSchema,
  oauthUserIdSchema,
  updatedAtSchema,
} from './shared';
import type { Recipes } from '@server/database';
import type { Selectable } from 'kysely';

export const recipesSchema = z.object({
  id: integerIdSchema,
  userId: oauthUserIdSchema,
  title: z.string().nonempty(),
  duration: z.number().int().positive(),
  steps: z.string().nonempty(),
  createdAt: createdAtSchema,
  updatedAt: updatedAtSchema,
});

export const recipesKeysAll = Object.keys(
  recipesSchema.shape
) as (keyof Recipes)[];

export const recipesKeysPublic = recipesKeysAll;

export type RecipesPublic = Pick<
  Selectable<Recipes>,
  (typeof recipesKeysPublic)[number]
>;
