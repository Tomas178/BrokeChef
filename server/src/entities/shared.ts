import z from 'zod';

export const integerIdSchema = z.number().int().positive();

export const oauthUserIdSchema = z.string().length(32);

export const ingredientToolNameSchema = z.string().nonempty();

export const createdAtSchema = z.date().default(() => new Date());
export const updatedAtSchema = z.date().default(() => new Date());
export const expiresAtSchema = z.date().default(() => new Date());
