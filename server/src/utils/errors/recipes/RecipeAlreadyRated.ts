export default class RecipeAlreadyRated extends Error {
  constructor() {
    super('Recipe already rated!');
  }
}
