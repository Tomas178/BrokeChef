import type { Insertable } from 'kysely';
import { Chance } from 'chance';
import { UserLogin, UserSignup } from './api';
import { Recipes } from '@server/shared/types';

export const random = process.env.CI ? Chance(1) : Chance();

export const fakeSignupUser = <T extends Insertable<UserSignup>>(
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

export const fakeRecipe = <T extends Partial<Insertable<Recipes>>>(
  overrides: T = {} as T
) => ({
  title: random.sentence(),
  duration: random.integer({ min: 1, max: 999 }),
  steps: [random.sentence(), random.sentence(), random.sentence()],
  ingredients: [random.string(), random.string(), random.string()],
  tools: [random.string(), random.string(), random.string()],
  ...overrides,
});
