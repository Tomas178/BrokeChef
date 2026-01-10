import ImageTooLarge from '@server/utils/errors/images/ImageTooLarge';
import type { Request } from 'express';
import type { Sharp } from 'sharp';

export const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB

export function createFileSizeValidator(
  req: Request,
  transformStream: Sharp,
  maxSize = DEFAULT_MAX_SIZE
) {
  let uploadedBytes = 0;
  let isStreamDestroyed = false;

  return (chunk: Buffer) => {
    if (isStreamDestroyed) {
      return;
    }

    uploadedBytes += chunk.length;

    if (uploadedBytes > maxSize) {
      isStreamDestroyed = true;

      req.unpipe(transformStream);
      req.resume();

      transformStream.destroy(new ImageTooLarge(maxSize));
    }
  };
}
