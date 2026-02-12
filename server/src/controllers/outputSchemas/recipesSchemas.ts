import { recipesSchema } from '@server/entities/recipes';
import { usersPublicWithoutIdSchema } from '@server/entities/users';
import { ratingSchema } from '@server/entities/ratings';
import * as z from 'zod';
import { arrayStringSchema } from '@server/entities/shared';

const urlSchema = z.string().trim();

const recipesPublicCommonOutputSchema = z.object({
  author: usersPublicWithoutIdSchema,
  imageUrl: urlSchema,
  rating: ratingSchema.nullish(),
});

export const recipesPublicArrayOutputSchema = z.array(
  recipesSchema.omit({ embedding: true, steps: true, imageUrl: true }).extend({
    ...recipesPublicCommonOutputSchema.shape,
    steps: z.string().nonempty().trim(),
  })
);

export const recipesPublicAllInfoOutputSchema = recipesSchema
  .omit({
    embedding: true,
    imageUrl: true,
  })
  .extend({
    ...recipesPublicCommonOutputSchema.shape,
    ingredients: arrayStringSchema,
    tools: arrayStringSchema,
  });
