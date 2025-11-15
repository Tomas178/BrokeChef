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

export const cookedRecipesKeysPublic = cookedRecipesKeysAll;

export type CookedRecipesPublic = Pick<
  Selectable<CookedRecipes>,
  (typeof cookedRecipesKeysPublic)[number]
>;
