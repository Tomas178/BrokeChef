export default class RatingNotFound extends Error {
  constructor() {
    super('Rated recipe not found!');
  }
}
