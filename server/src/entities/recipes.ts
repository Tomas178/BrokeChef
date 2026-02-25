import * as z from 'zod';
import type { Recipes } from '@server/database';
import type { Selectable } from 'kysely';
import {
  MAX_DURATION,
  MAX_RECIPE_TITLE_LENGTH,
  MIN_DURATION,
  MIN_RECIPE_TITLE_LENGTH,
} from '@server/shared/consts';
import { createdAtSchema, integerIdSchema, oauthUserIdSchema } from './shared';
import type { UsersPublicWithoutId } from './users';
import type { IngredientsName } from './ingredients';
import type { ToolsName } from './tools';
import type { Rating } from './ratings';

export const stepsSchema = z.array(z.string().nonempty().trim());

export const recipesSchema = z.object({
  id: integerIdSchema,
  userId: oauthUserIdSchema,
  title: z
    .string()
    .trim()
    .min(MIN_RECIPE_TITLE_LENGTH, 'Too short title')
    .max(MAX_RECIPE_TITLE_LENGTH, 'Too long title'),
  duration: z
    .number()
    .int()
    .min(MIN_DURATION, 'Too short duration')
    .max(MAX_DURATION, 'Too long duration'),
  steps: stepsSchema,
  imageUrl: z.string().trim().optional(),
  embedding: z.array(z.number().nullable()).optional(),
  createdAt: createdAtSchema,
});

export const recipesKeysAll = Object.keys(
  recipesSchema.shape
) as (keyof Recipes)[];

export const recipesKeysPublic = recipesKeysAll.filter(
  key => key !== 'embedding'
) as Exclude<keyof Recipes, 'embedding'>[];

export type RecipesPublic = Pick<
  Selectable<Recipes>,
  (typeof recipesKeysPublic)[number]
> & { author: UsersPublicWithoutId; rating: Rating };

export type RecipesPublicWithoutRating = Omit<RecipesPublic, 'rating'>;

export type RecipesPublicAllInfo = Omit<RecipesPublic, 'steps'> & {
  ingredients: IngredientsName[];
  tools: ToolsName[];
  steps: z.infer<typeof stepsSchema>;
};
