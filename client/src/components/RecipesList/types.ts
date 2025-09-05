export enum RECIPE_TYPE {
  CREATED = 'created',
  SAVED = 'saved',
}

export type recipeTypeKeys = (typeof RECIPE_TYPE)[keyof typeof RECIPE_TYPE];
