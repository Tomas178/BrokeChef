import * as z from 'zod';
import type { SavedRecipes } from '@server/database';
import type { Selectable } from 'kysely';
import { createdAtSchema, integerIdSchema, oauthUserIdSchema } from './shared';

export const savedRecipesSchema = z.object({
  recipeId: integerIdSchema,
  userId: oauthUserIdSchema,
  createdAt: createdAtSchema,
});

export const savedRecipesKeysAll = Object.keys(
  savedRecipesSchema.shape
) as (keyof SavedRecipes)[];

export const savedRecipesKeysPublic = savedRecipesKeysAll;

export type SavedRecipesPublic = Pick<
  Selectable<SavedRecipes>,
  (typeof savedRecipesKeysPublic)[number]
>;
