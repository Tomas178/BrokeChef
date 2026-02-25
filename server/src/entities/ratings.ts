import * as z from 'zod';
import type { Ratings } from '@server/database';
import type { Selectable } from 'kysely';
import { createdAtSchema, integerIdSchema, oauthUserIdSchema } from './shared';

const ratingSharedSchema = z.number().max(5);

export const averageRatingSchema = ratingSharedSchema.min(0);
export const averageRatingOptionalSchema = averageRatingSchema.optional();

export const ratingSchema = ratingSharedSchema.int().min(1);
export const ratingOptionalSchema = ratingSchema.optional();

export const ratingsSchema = z.object({
  recipeId: integerIdSchema,
  userId: oauthUserIdSchema,
  rating: ratingSchema,
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

export type Rating = z.infer<typeof ratingSchema>;
