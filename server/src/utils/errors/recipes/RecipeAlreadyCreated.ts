export default class RecipeAlreadyCreated extends Error {
  constructor() {
    super('You have already created recipe with this title');
  }
}
