import { AllowedMimeType } from '@server/enums/AllowedMimetype';
import type { ImageFolderValues } from '@server/enums/ImageFolder';
import logger from '@server/logger';
import { s3Client } from '@server/utils/AWSS3Client/client';
import { uploadImageStream } from '@server/utils/AWSS3Client/uploadImageStream';
import { createTransformStream } from '@server/utils/createTransformStream';
import { formUniqueFilename } from '@server/utils/formUniqueFilename';
import type { Request } from 'express';
import { createFileSizeValidator } from './createFileSizeValidator';

export async function handleStreamUpload(
  req: Request,
  folderName: ImageFolderValues
) {
  const uniqueFilename = formUniqueFilename();
  const key = `${folderName}/${uniqueFilename}`;

  const transformStream = createTransformStream();

  const validateFileSize = createFileSizeValidator(req, transformStream);

  req.on('data', validateFileSize);

  const uploadPromise = uploadImageStream(
    s3Client,
    key,
    transformStream,
    AllowedMimeType.JPEG
  );

  req.pipe(transformStream);

  try {
    await uploadPromise;
  } catch (error) {
    logger.error(`Upload failed for ${key}`);
    throw error;
  } finally {
    req.removeListener('data', validateFileSize);
  }

  logger.info(`Object created in S3: ${key}`);
  return key;
}
