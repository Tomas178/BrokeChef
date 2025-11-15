export default class RecipeAlreadyMarkedAsCooked extends Error {
  constructor() {
    super('Recipe already marked as cooked');
  }
}
