import { pipeline } from 'node:stream/promises';
import { performance } from 'node:perf_hooks';
import { AllowedMimeType } from '@server/enums/AllowedMimetype';
import type { ImageFolderValues } from '@server/enums/ImageFolder';
import logger from '@server/logger';
import { s3Client } from '@server/utils/AWSS3Client/client';
import { uploadImageStream } from '@server/utils/AWSS3Client/uploadImageStream';
import { createTransformStream } from '@server/utils/createTransformStream';
import { formUniqueFilename } from '@server/utils/formUniqueFilename';
import type { Request } from 'express';
import { FileSizeValidator } from './FileSizeValidator';

export async function handleStreamUpload(
  req: Request,
  folderName: ImageFolderValues
) {
  const start = performance.now();
  const uniqueFilename = formUniqueFilename();
  const key = `${folderName}/${uniqueFilename}`;

  const fileSizeValidator = new FileSizeValidator();
  const transformStream = createTransformStream();

  const pipelineStart = performance.now();
  const pipelinePromise = pipeline(req, fileSizeValidator, transformStream);

  try {
    const s3Start = performance.now();
    logger.info(`[Profiler] Starting S3 Upload for ${key}`);

    await uploadImageStream(
      s3Client,
      key,
      transformStream,
      AllowedMimeType.JPEG
    );

    const s3End = performance.now();
    logger.info(
      `[Profiler] S3 Upload Finished: ${((s3End - s3Start) / 1000).toFixed(2)}s`
    );

    const pipeEndStart = performance.now();
    await pipelinePromise;
    const pipeEndFinished = performance.now();

    logger.info(
      `[Profiler] Pipeline Finalization: ${((pipeEndFinished - pipeEndStart) / 1000).toFixed(2)}s`
    );
  } catch (error) {
    logger.error(
      `[Profiler] Upload failed after ${((performance.now() - start) / 1000).toFixed(2)}s`
    );
    logger.error(`Upload failed for ${key}`);

    transformStream.destroy();
    throw error;
  }

  const totalTime = ((performance.now() - start) / 1000).toFixed(2);
  logger.info(`[Profiler] TOTAL SUCCESSFUL UPLOAD: ${totalTime}s`);

  logger.info(`Object created in S3: ${key}`);
  return key;
}
