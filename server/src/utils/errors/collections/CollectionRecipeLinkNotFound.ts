export default class CollectionRecipeLinkNotFound extends Error {
  constructor() {
    super('No recipe is saved for this collection');
  }
}
