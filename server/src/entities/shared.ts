import * as z from 'zod';

export const integerIdSchema = z.number().int().positive();

export const oauthUserIdSchema = z.string().length(32);

export const ingredientToolNameSchema = z.string().nonempty();

export const createdAtSchema = z.date().default(() => new Date());
export const updatedAtSchema = z.date().default(() => new Date());
export const expiresAtSchema = z.date().default(() => new Date());

const POSTGRES_INT_MAX = 2_141_483_647;

export const paginationSchema = z.object({
  offset: z.number().int().min(0).max(POSTGRES_INT_MAX),
  limit: z.number().int().min(1).max(100),
});

export const userWithPaginationSchema = z.object({
  userId: oauthUserIdSchema,
  offset: paginationSchema.shape.offset.default(0),
  limit: paginationSchema.shape.limit.default(5),
});
