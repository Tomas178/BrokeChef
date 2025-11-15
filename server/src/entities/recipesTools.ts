import * as z from 'zod';
import type { RecipesTools } from '@server/database';
import type { Selectable } from 'kysely';
import { integerIdSchema } from './shared';

export const recipesToolsSchema = z.object({
  recipeId: integerIdSchema,
  toolId: integerIdSchema,
});

export const recipesToolsKeysAll = Object.keys(
  recipesToolsSchema.shape
) as (keyof RecipesTools)[];

export const recipesToolsKeysPublic = recipesToolsKeysAll;

export type RecipesToolsPublic = Pick<
  Selectable<RecipesTools>,
  (typeof recipesToolsKeysPublic)[number]
>;
