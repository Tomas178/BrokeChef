import * as z from 'zod';
import type { Users } from '@server/database';
import type { Selectable } from 'kysely';
import { createdAtSchema, oauthUserIdSchema, updatedAtSchema } from './shared';

export const usersSchema = z.object({
  id: oauthUserIdSchema,
  name: z.string().nonempty(),
  email: z.email(),
  emailVerified: z.boolean().default(false),
  image: z.string().optional(),
  createdAt: createdAtSchema,
  updatedAt: updatedAtSchema,
});

export const usersKeysAll = Object.keys(usersSchema.shape) as (keyof Users)[];

export const usersKeysPublic = ['id', 'name', 'email', 'image'] as const;

export const usersKeysPublicWithoutId = ['name', 'email', 'image'] as const;

export type UsersPublic = Pick<
  Selectable<Users>,
  (typeof usersKeysPublic)[number]
>;

export type UsersPublicWithoutId = Omit<UsersPublic, 'id'>;

export const authUserSchema = usersSchema.pick({ id: true });
export type AuthUser = z.infer<typeof authUserSchema>;
