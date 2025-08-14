import * as z from 'zod';
import type { Users } from '@server/database';
import type { Selectable } from 'kysely';
import { createdAtSchema, oauthUserIdSchema, updatedAtSchema } from './shared';

const imageUrlSchema = z.url().refine(
  url => {
    return (
      /^https:\/\/avatars\.githubusercontent\.com\/u\/\d+\?v=\d+$/.test(url) ||
      /^https:\/\/lh3\.googleusercontent\.com\/a\/[\w-]+(?:=[\dA-Za-z-]+)?$/.test(
        url
      )
    );
  },
  {
    message: 'Image URL must be from GitHub or Google',
  }
);

export const usersSchema = z.object({
  id: oauthUserIdSchema,
  name: z.string().nonempty(),
  email: z.email(),
  emailVerified: z.boolean().default(false),
  image: imageUrlSchema,
  createdAt: createdAtSchema,
  updatedAt: updatedAtSchema,
});

export const usersKeysAll = Object.keys(usersSchema.shape) as (keyof Users)[];

export const usersKeysPublic = ['id', 'name', 'email'] as const;

export const usersKeysPublicWithoutId = ['name', 'email'] as const;

export type UsersPublic = Pick<
  Selectable<Users>,
  (typeof usersKeysPublic)[number]
>;

export type UsersPublicWithoutId = Omit<UsersPublic, 'id'>;

export const authUserSchema = usersSchema.pick({ id: true });
export type AuthUser = z.infer<typeof authUserSchema>;
