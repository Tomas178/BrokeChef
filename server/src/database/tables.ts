import type { ObjectValues } from '@server/shared/types';

export const TABLES = {
  USERS: 'users',
  ACCOUNTS: 'accounts',
  SESSIONS: 'sessions',
  VERIFICATIONS: 'verifications',
  RECIPES: 'recipes',
  SAVED_RECIPES: 'saved_recipes',
  INGREDIENTS: 'ingredients',
  RECIPES_INGREDIENTS: 'recipes_ingredients',
  TOOLS: 'tools',
  RECIPES_TOOLS: 'recipes_tools',
  RATINGS: 'ratings',
  FOLLOWS: 'follows',
  COOKED_RECIPES: 'cooked_recipes',
} as const;

export type TablesValues = ObjectValues<typeof TABLES>;
