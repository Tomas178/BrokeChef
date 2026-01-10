import { Transform, type TransformCallback } from 'node:stream';
import { performance } from 'node:perf_hooks';
import logger from '@server/logger';
import ImageTooLarge from '@server/utils/errors/images/ImageTooLarge';
import { DEFAULT_MAX_FILE_SIZE } from '@server/shared/consts';

export class FileSizeValidator extends Transform {
  private maxFileSize: number;
  private uploadedBytes = 0;
  private startTime: number;
  private chunkCount = 0;
  private lastChunkTime = 0;

  constructor(maxFileSize = DEFAULT_MAX_FILE_SIZE) {
    super();
    this.maxFileSize = maxFileSize;
    this.startTime = performance.now();
  }

  _transform(chunk: Buffer, _: BufferEncoding, callback: TransformCallback) {
    this.chunkCount++;
    const now = performance.now();

    if (this.chunkCount === 1) {
      logger.info(
        `[Validator] First chunk received after ${((now - this.startTime) / 1000).toFixed(2)}s`
      );
    }

    this.uploadedBytes += chunk.length;
    this.lastChunkTime = now;

    if (this.uploadedBytes > this.maxFileSize) {
      callback(new ImageTooLarge(this.maxFileSize));
      return;
    }

    this.push(chunk);
    callback();
  }

  _flush(callback: TransformCallback) {
    const totalTime = ((performance.now() - this.startTime) / 1000).toFixed(2);
    logger.info(
      `[Validator] Stream Finished. Total Chunks: ${this.chunkCount}, Total Bytes: ${this.uploadedBytes}, Total Time: ${totalTime}s`
    );
    callback();
  }
}
