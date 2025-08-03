import type { Recipes, Users } from '@server/database';
import { random } from '@tests/utils/random';
import type { Insertable } from 'kysely';
import type { AuthUser } from '../users';

const randomOAuthId = () => random.string({ length: 32 });

export const fakeUser = <T extends Partial<Insertable<Users>>>(
  overrides: T = {} as T
) =>
  ({
    id: randomOAuthId(),
    name: random.name(),
    email: random.email(),
    emailVerified: random.bool(),
    image: random.url({ domain: 'avatars.githubusercontent.com' }),
    ...overrides,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) satisfies Insertable<Users>;

export const fakeAuthUser = <T extends Partial<AuthUser>>(
  overrides: T = {} as T
): AuthUser => ({
  id: randomOAuthId(),
  email: random.email(),
  ...overrides,
});

export const fakeRecipe = <T extends Partial<Insertable<Recipes>>>(
  overrides: T = {} as T
) =>
  ({
    userId: randomOAuthId(),
    title: random.string(),
    duration: random.integer({
      min: 1,
      max: 100_000_0,
    }),
    steps: random.paragraph(),
    ...overrides,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) satisfies Insertable<Recipes>;
