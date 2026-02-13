import { usersPublicImageNullableSchema } from '@server/entities/users';
import * as z from 'zod';
import { recipesPublicArrayOutputSchema } from './recipesSchemas';

export const usersPublicArrayOutputSchema = z.array(
  usersPublicImageNullableSchema
);

export const allRecipesOutputSchema = z.object({
  created: recipesPublicArrayOutputSchema,
  saved: recipesPublicArrayOutputSchema,
});
