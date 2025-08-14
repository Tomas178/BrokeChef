export default class RecipeAlreadySaved extends Error {
  constructor(id: number) {
    super(`Recipe with id: ${id} already saved!`);
  }
}
