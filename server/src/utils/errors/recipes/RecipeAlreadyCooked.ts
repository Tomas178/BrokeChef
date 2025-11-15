export default class RecipeAlreadyCooked extends Error {
  constructor() {
    super('Recipe already marked as cooked');
  }
}
