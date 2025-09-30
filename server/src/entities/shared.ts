import * as z from 'zod';

export const integerIdSchema = z.number().int().positive();

export const oauthUserIdSchema = z.string().length(32);

export const arrayStringSchema = z.array(z.string().nonempty().max(100).trim());

export const createdAtSchema = z.date().default(() => new Date());
export const updatedAtSchema = z.date().default(() => new Date());
export const expiresAtSchema = z.date().default(() => new Date());

const POSTGRES_INT_MAX = 2_141_483_647;

export const paginationSchema = z.object({
  offset: z.number().int().min(0).max(POSTGRES_INT_MAX).default(0),
  limit: z.number().int().min(1).max(100).default(5),
});

export const userWithPaginationSchema = paginationSchema.extend({
  userId: oauthUserIdSchema.optional(),
});

export type UserWithPagination = z.infer<typeof userWithPaginationSchema>;

export type RatingFromDB = number | undefined;
