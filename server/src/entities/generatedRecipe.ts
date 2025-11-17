import * as z from 'zod';
import {
  MAX_RECIPES_TO_GENERATE_PER_REQUEST,
  MIN_RECIPES_TO_GENERATE_PER_REQUEST,
} from '@server/shared/consts';
import { recipesSchema } from './recipes';
import { arrayStringSchema } from './shared';

export const generatedRecipeSchema = recipesSchema
  .pick({
    title: true,
    duration: true,
  })
  .extend({
    steps: arrayStringSchema,
    ingredients: arrayStringSchema,
    tools: arrayStringSchema,
    image: z.instanceof(Buffer),
  });

export const validGenerateRecipesNumber = z
  .number()
  .int()
  .min(MIN_RECIPES_TO_GENERATE_PER_REQUEST)
  .max(MAX_RECIPES_TO_GENERATE_PER_REQUEST);

export type GeneratedRecipe = z.infer<typeof generatedRecipeSchema>;
