export default class RecipeAlreadySaved extends Error {
  constructor() {
    super('Recipe already saved!');
  }
}
