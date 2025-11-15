import * as z from 'zod';
import {
  MAX_COLLECTION_TITLE_LENGTH,
  MIN_COLLECTION_TITLE_LENGTH,
} from '@server/shared/consts';
import type { Collections } from '@server/database';
import type { Selectable } from 'kysely';
import {
  createdAtSchema,
  integerIdSchema,
  oauthUserIdSchema,
  updatedAtSchema,
} from './shared';

export const collectionsSchema = z.object({
  id: integerIdSchema,
  userId: oauthUserIdSchema,
  title: z
    .string()
    .trim()
    .min(MIN_COLLECTION_TITLE_LENGTH, 'Too short title')
    .max(MAX_COLLECTION_TITLE_LENGTH, 'Too long title'),
  createdAt: createdAtSchema,
  updatedAt: updatedAtSchema,
});

export const collectionsKeysAll = Object.keys(
  collectionsSchema.shape
) as (keyof Collections)[];

export const collectionsKeysPublic = collectionsKeysAll;

export type CollectionsPublic = Pick<
  Selectable<Collections>,
  (typeof collectionsKeysPublic)[number]
>;
