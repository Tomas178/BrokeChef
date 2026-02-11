import { recipesSchema } from '@server/entities/recipes';
import { usersPublicWithoutIdSchema } from '@server/entities/users';
import { ratingOptionalSchema } from '@server/entities/ratings';
import * as z from 'zod';

export const recipesPublicArrayOutputSchema = z.array(
  recipesSchema.omit({ embedding: true, steps: true, imageUrl: true }).extend({
    author: usersPublicWithoutIdSchema,
    rating: ratingOptionalSchema,
    steps: z.string().nonempty().trim(),
    imageUrl: z.string().trim(),
  })
);
