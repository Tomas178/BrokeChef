import type { Users } from '@server/shared/types';
import type { Insertable } from 'kysely';
import { Chance } from 'chance';

export const random = process.env.CI ? Chance(1) : Chance();

export const fakeSignupUser = <T extends Insertable<Users>>(
  overrides: Partial<T> = {} as T
) => ({
  name: random.string(),
  email: random.email(),
  password: 'password.123',
  image: undefined,
  ...overrides,
});
