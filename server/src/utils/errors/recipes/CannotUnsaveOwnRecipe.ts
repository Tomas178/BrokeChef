export default class CannotUnsaveOwnRecipe extends Error {
  constructor() {
    super('Cannot unsave own recipe');
  }
}
