import type { Insertable } from 'kysely';
import { Chance } from 'chance';
import { UserLogin, UserSignup } from './api';
import { Recipes, RecipesPublicAllInfo } from '@server/shared/types';
import { MAX_RECIPE_TITLE_LENGTH } from '@server/shared/consts';

export const random = process.env.CI ? Chance(1) : Chance();

const randomOAuthId = () => random.string({ length: 32 });
const randomDuration = () => random.integer({ min: 1, max: 999 });

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
  duration: randomDuration(),
  steps: [random.sentence(), random.sentence(), random.sentence()],
  ingredients: [random.string(), random.string(), random.string()],
  tools: [random.string(), random.string(), random.string()],
  ...overrides,
});

export const fakeRecipeAllInfo = <T extends Partial<RecipesPublicAllInfo>>(
  overrides: T = {} as T
) => ({
  id: random.integer({ min: 1 }),
  userId: randomOAuthId(),
  title: random.string({ length: MAX_RECIPE_TITLE_LENGTH }),
  duration: randomDuration(),
  steps: random.paragraph(),
  imageUrl: random.url(),
  author: {
    email: random.email(),
    name: random.name(),
  },
  ingredients: [random.string()],
  tools: [random.string()],
  ...overrides,
});
