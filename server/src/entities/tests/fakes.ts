import type {
  Ingredients,
  Recipes,
  RecipesIngredients,
  Tools,
  Users,
} from '@server/database';
import { random } from '@tests/utils/random';
import type { Insertable } from 'kysely';
import type { AuthUser } from '../users';

const randomOAuthId = () => random.string({ length: 32 });
const randomIntegerId = () => random.integer({ min: 1, max: 100_00_0 });

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
    duration: random.string(),
    steps: random.paragraph(),
    ...overrides,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) satisfies Insertable<Recipes>;

export const fakeIngredient = <T extends Partial<Insertable<Ingredients>>>(
  overrides: T = {} as T
) => ({
  name: random.string(),
  ...overrides,
  createdAt: new Date(),
});

export const fakeTool = <T extends Partial<Insertable<Tools>>>(
  overrides: T = {} as T
) => ({
  name: random.string(),
  ...overrides,
  createdAt: new Date(),
});

export const fakeRecipeIngredient = <
  T extends Partial<Insertable<RecipesIngredients>>,
>(
  overrides: T = {} as T
) => ({
  recipeId: randomIntegerId(),
  ingredientId: randomIntegerId(),
  ...overrides,
});
