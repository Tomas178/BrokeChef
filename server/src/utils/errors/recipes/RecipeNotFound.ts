export default class RecipeNotFound extends Error {
  constructor(id: number) {
    super(`Recipe with id: ${id} not found!`);
  }
}
