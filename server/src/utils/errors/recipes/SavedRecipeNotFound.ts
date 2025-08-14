export default class SavedRecipeNotFound extends Error {
  constructor() {
    super('Saved recipe not found');
  }
}
