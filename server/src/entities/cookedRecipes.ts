import * as z from 'zod';
import type { CookedRecipes } from '@server/database';
import type { Selectable } from 'kysely';
import { createdAtSchema, integerIdSchema, oauthUserIdSchema } from './shared';

export const cookedRecipesSchema = z.object({
  userId: oauthUserIdSchema,
  recipeId: integerIdSchema,
  createdAt: createdAtSchema,
});

export const cookedRecipesKeysAll = Object.keys(
  cookedRecipesSchema.shape
) as (keyof CookedRecipes)[];

export const cookedRecipesPublic = cookedRecipesKeysAll;

export type cookedRecipesPublic = Pick<
  Selectable<CookedRecipes>,
  (typeof cookedRecipesPublic)[number]
>;
