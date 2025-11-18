import * as z from 'zod';
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
    imageUrl: z.string(),
  });

export type GeneratedRecipe = z.infer<typeof generatedRecipeSchema>;
