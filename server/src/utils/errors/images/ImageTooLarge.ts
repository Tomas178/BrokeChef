import BadRequest from '../general/BadRequest';

export default class ImageTooLarge extends BadRequest {
  constructor() {
    super('Image too large please upload image <= 5MB');
  }
}
