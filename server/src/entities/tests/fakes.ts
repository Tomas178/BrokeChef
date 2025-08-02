import type { Recipes, Users } from '@server/database';
import { random } from '@tests/utils/random';
import type { Insertable } from 'kysely';

const randomIntegerId = () =>
  random.integer({
    min: 1,
    max: 100_000_0,
  });

export const fakeUser = <T extends Partial<Insertable<Users>>>(overrides: T) =>
  ({
    id: 'a'.repeat(32),
    name: random.name(),
    email: random.email(),
    emailVerified: random.bool(),
    image: random.url({ domain: 'avatars.githubusercontent.com' }),
    ...overrides,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) satisfies Insertable<Users>;

export const fakeRecipe = <T extends Partial<Insertable<Recipes>>>(
  overrides: T = {} as T
) =>
  ({
    userId: 'a'.repeat(32),
    title: random.string(),
    duration: random.integer(),
    steps: random.paragraph(),
    ...overrides,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) satisfies Insertable<Recipes>;
