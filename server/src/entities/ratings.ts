import * as z from 'zod';
import type { Ratings } from '@server/database';
import type { Selectable } from 'kysely';
import { createdAtSchema, integerIdSchema, oauthUserIdSchema } from './shared';

export const ratingsSchema = z.object({
  recipeId: integerIdSchema,
  userId: oauthUserIdSchema,
  createdAt: createdAtSchema,
});

export const ratingsKeysAll = Object.keys(
  ratingsSchema.shape
) as (keyof Ratings)[];

export const ratingsKeysPublic = ratingsKeysAll;

export type ratingsPublic = Pick<
  Selectable<Ratings>,
  (typeof ratingsKeysPublic)[number]
>;
