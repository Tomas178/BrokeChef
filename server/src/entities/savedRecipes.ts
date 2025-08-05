import * as z from 'zod';
import { createdAtSchema, integerIdSchema, oauthUserIdSchema } from './shared';
import type { SavedRecipes } from '@server/database';
import type { Selectable } from 'kysely';

export const savedRecipesSchema = z.object({
  recipeId: integerIdSchema,
  userId: oauthUserIdSchema,
  createdAt: createdAtSchema,
});

export const savedRecipesKeysAll = Object.keys(
  savedRecipesSchema.shape
) as (keyof SavedRecipes)[];

export const savedRecipesKeysPublic = savedRecipesKeysAll;

export type savedRecipesPublic = Pick<
  Selectable<SavedRecipes>,
  (typeof savedRecipesKeysPublic)[number]
>;
