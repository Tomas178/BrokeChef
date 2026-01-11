import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ImageFolderValues } from '@server/enums/ImageFolder';
import logger from '@server/logger';
import { formUniqueFilename } from '@server/utils/formUniqueFilename';
import { createTransformStream } from '@server/utils/createTransformStream';
import { uploadImageStream } from '@server/utils/AWSS3Client/uploadImageStream';
import { s3Client } from '@server/utils/AWSS3Client/client';
import { AllowedMimeType } from '@server/enums/AllowedMimetype';

export async function handleStreamUpload(
  fileStream: Readable,
  folderName: ImageFolderValues
) {
  const uniqueFilename = formUniqueFilename();
  const key = `${folderName}/${uniqueFilename}`;

  const transformStream = createTransformStream();

  const upload = uploadImageStream(
    s3Client,
    key,
    transformStream,
    AllowedMimeType.JPEG
  );

  try {
    await pipeline(fileStream, transformStream);
    await upload.done();

    logger.info(`Object created in S3: ${key}`);
    return key;
  } catch (error) {
    logger.error(`Upload to S3 failed: ${key}`);
    throw error;
  }
}
