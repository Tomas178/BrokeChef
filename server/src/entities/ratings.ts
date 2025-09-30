import * as z from 'zod';
import type { Ratings } from '@server/database';
import type { Selectable } from 'kysely';
import { createdAtSchema, integerIdSchema, oauthUserIdSchema } from './shared';

export const ratingsSchema = z.object({
  recipeId: integerIdSchema,
  userId: oauthUserIdSchema,
  rating: z.number().int().min(1).max(5),
  createdAt: createdAtSchema,
});

export const ratingsKeysAll = Object.keys(
  ratingsSchema.shape
) as (keyof Ratings)[];

export const ratingsKeysPublic = ratingsKeysAll;

export type RatingsPublic = Pick<
  Selectable<Ratings>,
  (typeof ratingsKeysPublic)[number]
>;

export type Rating = Pick<RatingsPublic, 'rating'>['rating'];
