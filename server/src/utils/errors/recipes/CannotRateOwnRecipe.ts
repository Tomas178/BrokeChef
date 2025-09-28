export default class CannotRateOwnRecipe extends Error {
  constructor() {
    super('Cannot rate own recipe');
  }
}
