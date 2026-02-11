export type * from '@server/database/types';

export type * from '@server/entities/ingredients';
export type * from '@server/entities/recipes';
export type * from '@server/entities/recipesIngredients';
export type * from '@server/entities/recipesTools';
export type * from '@server/entities/savedRecipes';
export type * from '@server/entities/tools';
export type * from '@server/entities/users';
export type * from '@server/entities/ratings';
export type * from '@server/entities/cookedRecipes';
export type * from '@server/entities/collections';
export type * from '@server/entities/collectionsRecipes';
export type * from '@server/entities/generatedRecipe';
export type * from '@server/entities/shared';
export type * from '@server/entities/outputSchemas';

export type * from '@server/controllers/recipes/create';
export type * from '@server/controllers/ratings/create';

export type * from '@server/utils/SSE';

export type ObjectValues<T> = T[keyof T];
