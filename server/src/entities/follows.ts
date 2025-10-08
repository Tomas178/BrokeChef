import * as z from 'zod';
import type { Follows } from '@server/database';
import type { Selectable } from 'kysely';
import { createdAtSchema, oauthUserIdSchema } from './shared';

export const followsSchema = z.object({
  followerId: oauthUserIdSchema,
  followedId: oauthUserIdSchema,
  createdAt: createdAtSchema,
});

export const followsKeysAll = Object.keys(
  followsSchema.shape
) as (keyof Follows)[];

export const followsKeysPublic = followsKeysAll;

export type FollowsPublic = Pick<
  Selectable<Follows>,
  (typeof followsKeysPublic)[number]
>;
