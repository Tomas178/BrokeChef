export default class CannotUnsaveOwnRecipe extends Error {
  constructor(recipeId: number) {
    super(`Cannot unsave own recipe (ID: ${recipeId}`);
  }
}
