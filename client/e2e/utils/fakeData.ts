import type { Users } from '@server/shared/types';
import type { Insertable } from 'kysely';
import { Chance } from 'chance';

export const random = process.env.CI ? Chance(1) : Chance();

export const fakeUser = <T extends Insertable<Users>>(
  overrides: Partial<T> = {} as T
) => ({
  username: random.string(),
  email: random.email(),
  password: 'password.123',
  ...overrides,
});
