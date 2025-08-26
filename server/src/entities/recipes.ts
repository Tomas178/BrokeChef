import * as z from 'zod';
import type { Recipes } from '@server/database';
import type { Selectable } from 'kysely';
import {
  arrayStringSchema,
  createdAtSchema,
  integerIdSchema,
  oauthUserIdSchema,
  updatedAtSchema,
} from './shared';
import type { UsersPublicWithoutId } from './users';

export const recipesSchema = z.object({
  id: integerIdSchema,
  userId: oauthUserIdSchema,
  title: z.string().nonempty(),
  duration: z.number().int().min(1),
  steps: arrayStringSchema,
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
> & { author: UsersPublicWithoutId };
