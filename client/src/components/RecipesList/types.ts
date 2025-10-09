import type { ObjectValues } from '@server/shared/types';

export const RECIPE_TYPE = {
  CREATED: 'created',
  SAVED: 'saved',
} as const;

export type RecipeTypeValues = ObjectValues<typeof RECIPE_TYPE>;
