export default class CookedRecipeNotFound extends Error {
  constructor() {
    super('Cooked recipe link not found');
  }
}
