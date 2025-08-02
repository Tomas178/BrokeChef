import z, { email } from 'zod';
import { oauthUserIdSchema } from './shared';
import type { Users } from '@server/database';
import type { Selectable } from 'kysely';

const imageUrlSchema = z.url().refine(
  url => {
    return (
      /^https:\/\/avatars\.githubusercontent\.com\/u\/\d+\?v=\d+$/.test(url) ||
      /^https:\/\/lh3\.googleusercontent\.com\/a\/[A-Za-z0-9_-]+(?:=[A-Za-z0-9-]+)?$/.test(
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
  emailVerified: z.boolean(),
  image: imageUrlSchema,
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const usersKeysAll = Object.keys(usersSchema.shape) as (keyof Users)[];

export const usersKeysPublic = ['id', 'name', 'email'] as const;

export type UsersPublic = Pick<
  Selectable<Users>,
  (typeof usersKeysPublic)[number]
>;
