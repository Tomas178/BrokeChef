import z from 'zod';

export const integerIdSchema = z.number().int().positive();

export const oauthUserIdSchema = z
  .string()
  .length(32)
  .regex(/^[A-Za-z0-9]+$/);

export const createdAtSchema = z.date().default(() => new Date());
export const updatedAtSchema = z.date().default(() => new Date());
export const expiresAtSchema = z.date().default(() => new Date());
