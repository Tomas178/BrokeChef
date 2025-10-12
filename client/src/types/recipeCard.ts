import type { ObjectValues } from '@server/shared/types';

export const RECIPE_CARD_VARIANT = {
  HOMEPAGE: 'homepage',
  RECIPES_LIST: 'recipesList',
} as const;

export type RecipeCardVariant = ObjectValues<typeof RECIPE_CARD_VARIANT>;
