import ImageTooLarge from '@server/utils/errors/images/ImageTooLarge';
import type { Request } from 'express';
import type { Sharp } from 'sharp';

export const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export class FileSizeValidator {
  private req: Request;
  private transformStream: Sharp;
  private maxSize = DEFAULT_MAX_FILE_SIZE;

  private uploadedBytes = 0;
  private isStreamDestroyed = false;

  constructor(req: Request, transformStream: Sharp, maxSize?: number) {
    this.req = req;
    this.transformStream = transformStream;

    if (maxSize) {
      this.maxSize = maxSize;
    }
  }

  private checkSize() {
    if (this.uploadedBytes > this.maxSize) {
      this.isStreamDestroyed = true;

      this.req.unpipe(this.transformStream);
      this.req.resume();

      this.transformStream.destroy(new ImageTooLarge(this.maxSize));
    }
  }

  process = (chunk: Buffer) => {
    if (this.isStreamDestroyed) {
      return;
    }

    this.uploadedBytes += chunk.length;

    this.checkSize();
  };
}
