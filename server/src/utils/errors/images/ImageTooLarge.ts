import { DEFAULT_MAX_FILE_SIZE } from '@server/shared/consts';
import BadRequest from '../general/BadRequest';

export default class ImageTooLarge extends BadRequest {
  constructor(sizeInBytes = DEFAULT_MAX_FILE_SIZE) {
    super(
      `Image too large please upload image <= ${(sizeInBytes / 1024 / 1024).toFixed(0)}MB`
    );
  }
}
