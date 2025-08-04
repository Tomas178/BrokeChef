import z from 'zod';
import { integerIdSchema } from './shared';
import type { RecipesTools } from '@server/database';
import type { Selectable } from 'kysely';

export const recipesToolsSchema = z.object({
  recipeId: integerIdSchema,
  toolId: integerIdSchema,
});

export const recipesToolsKeysAll = Object.keys(
  recipesToolsSchema.shape
) as (keyof RecipesTools)[];

export const recipesToolsPublic = recipesToolsKeysAll;

export type recipesToolsPublic = Pick<
  Selectable<RecipesTools>,
  (typeof recipesToolsPublic)[number]
>;
