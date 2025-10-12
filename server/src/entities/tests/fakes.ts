/* eslint-disable unicorn/no-null */
import type {
  Follows,
  Ingredients,
  Ratings,
  Recipes,
  SavedRecipes,
  Tools,
} from '@server/database';
import { random } from '@tests/utils/random';
import type { Insertable } from 'kysely';
import type { CreateRecipeInput } from '@server/controllers/recipes/create';
import type { AuthUser, UsersPublic } from '../users';
import type {
  RecipesPublicWithoutRating,
  RecipesPublicAllInfo,
  RecipesPublic,
} from '../recipes';
import type { ToolsPublic } from '../tools';
import type { IngredientsPublic } from '../ingredients';

const randomOAuthId = () => random.string({ length: 32 });

const randomDuration = () => random.integer({ min: 1, max: 240 });

const randomRecipeId = () => random.integer({ min: 1, max: 10_000_000 });

const randomRating = () => random.integer({ min: 1, max: 5 });

export const fakeUser = <T extends Partial<UsersPublic>>(
  overrides: T = {} as T
) => ({
  id: randomOAuthId(),
  name: random.name(),
  email: random.email(),
  emailVerified: random.bool(),
  image:
    (random.url({ domain: 'avatars.githubusercontent.com' }) as string) || null,
  ...overrides,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const fakeAuthUser = <T extends Partial<AuthUser>>(
  overrides: T = {} as T
): AuthUser => ({
  id: randomOAuthId(),
  email: random.email(),
  ...overrides,
});

export const fakeRecipe = <T extends Partial<Insertable<Recipes>>>(
  overrides: T = {} as T
) => ({
  userId: randomOAuthId(),
  title: random.string(),
  duration: randomDuration(),
  steps: random.paragraph(),
  imageUrl: random.url(),
  ...overrides,
  createdAt: new Date(),
});

export const fakeRecipeWithRating = <T extends Partial<RecipesPublic>>(
  overrides: T = {} as T
) => ({
  userId: randomOAuthId(),
  title: random.string(),
  duration: randomDuration(),
  steps: random.paragraph(),
  imageUrl: random.url(),
  rating: randomRating(),
  ...overrides,
  createdAt: new Date(),
});

export const fakeRecipeWithAuthor = <
  T extends Partial<RecipesPublicWithoutRating>,
>(
  overrides: T = {} as T
) => ({
  id: randomRecipeId(),
  userId: randomOAuthId(),
  title: random.string(),
  duration: randomDuration(),
  steps: random.paragraph(),
  imageUrl: random.url(),
  author: {
    email: random.email(),
    name: random.name(),
  },
  ...overrides,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const fakeRecipeAllInfo = <T extends Partial<RecipesPublicAllInfo>>(
  overrides: T = {} as T
) => ({
  id: randomRecipeId(),
  userId: randomOAuthId(),
  title: random.string(),
  duration: randomDuration(),
  steps: random.paragraph(),
  imageUrl: random.url(),
  author: {
    email: random.email(),
    name: random.name(),
    image: random.url(),
  },
  ingredients: [random.string()],
  tools: [random.string()],
  rating: randomRating(),
  ...overrides,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const fakeIngredient = <T extends Partial<Insertable<Ingredients>>>(
  overrides: T = {} as T
) => ({
  name: random.string(),
  ...overrides,
  createdAt: new Date(),
});

export const fakeFullIngredient = <T extends Partial<IngredientsPublic>>(
  overrides: T = {} as T
) => ({
  id: randomRecipeId(),
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

export const fakeFullTool = <T extends Partial<ToolsPublic>>(
  overrides: T = {} as T
) => ({
  id: randomRecipeId(),
  name: random.string(),
  ...overrides,
  createdAt: new Date(),
});

export const fakeCreateRecipeData = <
  T extends Partial<Insertable<CreateRecipeInput>>,
>(
  overrides: T = {} as T
) => ({
  title: random.string(),
  duration: randomDuration(),
  imageUrl: random.url(),
  steps: [random.string(), random.string()],
  ingredients: [random.word(), random.word()],
  tools: [random.word(), random.word()],
  ...overrides,
});

export const fakeSavedRecipe = <T extends Partial<Insertable<SavedRecipes>>>(
  overrides: T = {} as T
) => ({
  recipeId: randomRecipeId(),
  userId: randomOAuthId(),
  ...overrides,
  createdAt: new Date(),
});

export const fakeRating = <T extends Partial<Insertable<Ratings>>>(
  overrides: T = {} as T
) => ({
  recipeId: randomRecipeId(),
  userId: randomOAuthId(),
  rating: randomRating(),
  ...overrides,
  createdAt: new Date(),
});

export const fakeFollow = <T extends Partial<Insertable<Follows>>>(
  overrides: T = {} as T
) => ({
  followerId: randomOAuthId(),
  followedId: randomOAuthId(),
  ...overrides,
  createdAt: new Date(),
});
