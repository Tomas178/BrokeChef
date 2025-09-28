export default class RatedRecipeNotFound extends Error {
  constructor() {
    super('Rated recipe not found!');
  }
}
