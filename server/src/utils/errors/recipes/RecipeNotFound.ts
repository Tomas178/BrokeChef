export default class RecipeNotFound extends Error {
  constructor() {
    super('Recipe not found!');
  }
}
