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
import type { IngredientsName } from './ingredients';
import type { ToolsName } from './tools';

export const recipesSchema = z.object({
  id: integerIdSchema,
  userId: oauthUserIdSchema,
  title: z.string().trim().min(1).max(64),
  duration: z.number().int().min(1).max(1000),
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

export type RecipesPublicAllInfo = Omit<RecipesPublic, 'steps'> & {
  ingredients: IngredientsName[];
  tools: ToolsName[];
  steps: string[];
};
