export default class CollectionRecipesLinkAlreadyExists extends Error {
  constructor() {
    super('Recipe is already saved in this collection');
  }
}
