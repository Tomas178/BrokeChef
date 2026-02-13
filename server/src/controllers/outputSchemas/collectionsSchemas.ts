import { collectionsPublicBasicSchema } from '@server/entities/collections';
import * as z from 'zod';

export const collectionsPublicBasicArrayOutputSchema = z.array(
  collectionsPublicBasicSchema
);
