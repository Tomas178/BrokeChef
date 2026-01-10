import { Transform, type TransformCallback } from 'node:stream';
import ImageTooLarge from '@server/utils/errors/images/ImageTooLarge';
import { DEFAULT_MAX_FILE_SIZE } from '@server/shared/consts';

export class FileSizeValidator extends Transform {
  private maxFileSize: number;
  private uploadedBytes = 0;

  constructor(maxFileSize = DEFAULT_MAX_FILE_SIZE) {
    super();
    this.maxFileSize = maxFileSize;
  }

  _transform(chunk: Buffer, _: BufferEncoding, callback: TransformCallback) {
    this.uploadedBytes += chunk.length;

    if (this.uploadedBytes > this.maxFileSize) {
      callback(new ImageTooLarge(this.maxFileSize));
      return;
    }

    this.push(chunk);
    callback();
  }
}
