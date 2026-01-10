import { pipeline } from 'node:stream/promises';
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
  const uniqueFilename = formUniqueFilename();
  const key = `${folderName}/${uniqueFilename}`;

  const fileSizeValidator = new FileSizeValidator();
  const transformStream = createTransformStream();

  const uploadPromise = uploadImageStream(
    s3Client,
    key,
    transformStream,
    AllowedMimeType.JPEG
  );

  const pipelinePromise = pipeline(req, fileSizeValidator, transformStream);

  try {
    await Promise.all([pipelinePromise, uploadPromise]);
  } catch (error) {
    logger.error(`Upload failed for ${key}`);

    transformStream.destroy();
    throw error;
  }

  logger.info(`Object created in S3: ${key}`);
  return key;
}
