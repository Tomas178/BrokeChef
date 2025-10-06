export enum RecipesSort {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  HIGHEST_RATING = 'highestRating',
  LOWEST_RATING = 'lowestRating',
}

export type RecipesSortValues = `${RecipesSort}`;
