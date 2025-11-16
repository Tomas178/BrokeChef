export default class CollectionAlreadyCreated extends Error {
  constructor() {
    super('You have already created collection with this title');
  }
}
