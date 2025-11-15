import * as z from 'zod';
import type { CollectionsRecipes } from '@server/database';
import type { Selectable } from 'kysely';
import { createdAtSchema, integerIdSchema } from './shared';

export const collectionsRecipesSchema = z.object({
  collectionId: integerIdSchema,
  recipeId: integerIdSchema,
  createdAt: createdAtSchema,
});

export const collectionsRecipesKeysAll = Object.keys(
  collectionsRecipesSchema.shape
) as (keyof CollectionsRecipes)[];

export const collectionsRecipesKeysPublic = collectionsRecipesKeysAll;

export type CollectionsRecipesPublic = Pick<
  Selectable<CollectionsRecipes>,
  (typeof collectionsRecipesKeysPublic)[number]
>;
