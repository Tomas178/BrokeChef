import { usersPublicImageNullableSchema } from '@server/entities/users';
import * as z from 'zod';

export const usersPublicArrayOutputSchema = z.array(
  usersPublicImageNullableSchema
);
