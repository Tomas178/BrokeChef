import BadRequest from '../general/BadRequest';

export default class WrongImageType extends BadRequest {
  constructor() {
    super('Supported types for image are .png, .jpg or .jpeg');
  }
}
