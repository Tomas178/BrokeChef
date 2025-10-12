import * as z from 'zod';
import type { Recipes } from '@server/database';
import type { Selectable } from 'kysely';
import {
  MAX_DURATION,
  MAX_TITLE_LENGTH,
  MIN_DURATION,
  MIN_TITLE_LENGTH,
} from '@server/shared/consts';
import { createdAtSchema, integerIdSchema, oauthUserIdSchema } from './shared';
import type { UsersPublicWithoutId } from './users';
import type { IngredientsName } from './ingredients';
import type { ToolsName } from './tools';
import type { Rating } from './ratings';

export const recipesSchema = z.object({
  id: integerIdSchema,
  userId: oauthUserIdSchema,
  title: z
    .string()
    .trim()
    .min(MIN_TITLE_LENGTH, 'Too short title')
    .max(MAX_TITLE_LENGTH, 'Too long title'),
  duration: z
    .number()
    .int()
    .min(MIN_DURATION, 'Too short duration')
    .max(MAX_DURATION, 'Too long duration'),
  steps: z.array(z.string().nonempty().trim()),
  imageUrl: z.string().trim().optional(),
  createdAt: createdAtSchema,
});

export const recipesKeysAll = Object.keys(
  recipesSchema.shape
) as (keyof Recipes)[];

export const recipesKeysPublic = recipesKeysAll;

export type RecipesPublic = Pick<
  Selectable<Recipes>,
  (typeof recipesKeysPublic)[number]
> & { author: UsersPublicWithoutId; rating: Rating };

export type RecipesPublicWithoutRating = Pick<
  Selectable<Recipes>,
  (typeof recipesKeysPublic)[number]
> & { author: UsersPublicWithoutId };

export type RecipesPublicAllInfo = Omit<RecipesPublic, 'steps'> & {
  ingredients: IngredientsName[];
  tools: ToolsName[];
  steps: string[];
};
