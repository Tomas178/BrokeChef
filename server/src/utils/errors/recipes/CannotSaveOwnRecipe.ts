export default class CannotSaveOwnRecipe extends Error {
  constructor(recipeId: number) {
    super(`Cannot save own recipe (ID: ${recipeId}`);
  }
}
