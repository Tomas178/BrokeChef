export default class CollectionNotFound extends Error {
  constructor() {
    super('Collection was not found');
  }
}
