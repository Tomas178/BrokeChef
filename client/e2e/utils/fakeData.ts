import type { Insertable } from 'kysely';
import { Chance } from 'chance';
import { UserLogin, userSignup } from './api';

export const random = process.env.CI ? Chance(1) : Chance();

export const fakeSignupUser = <T extends Insertable<userSignup>>(
  overrides: Partial<T> = {} as T
) => ({
  name: random.string(),
  email: random.email(),
  password: 'password.123',
  ...overrides,
});

export const fakeUser = <T extends Insertable<UserLogin>>(
  overrides: Partial<T> = {} as T
) => ({
  email: random.email(),
  password: 'password.123',
  ...overrides,
});
