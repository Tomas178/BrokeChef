export default class CannotMarkOwnRecipeAsCooked extends Error {
  constructor() {
    super('Cannot mark you own recipe as already cooked');
  }
}
