import BadRequest from '../general/BadRequest';

export default class ImageTooLarge extends BadRequest {
  constructor(sizeInBytes: number) {
    super(
      `Image too large please upload image <= ${(sizeInBytes / 1024 / 1024).toFixed(0)}MB`
    );
  }
}
