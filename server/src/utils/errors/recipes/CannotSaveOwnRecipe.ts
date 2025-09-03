export default class CannotSaveOwnRecipe extends Error {
  constructor() {
    super('Cannot save own recipe');
  }
}
