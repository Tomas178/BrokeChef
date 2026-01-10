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
  fileBuffer: Buffer,
  folderName: ImageFolderValues
) {
  const uniqueFilename = formUniqueFilename();
  const key = `${folderName}/${uniqueFilename}`;

  try {
    const bufferStream = Readable.from(fileBuffer);

    const transformStream = createTransformStream();

    const uploadPromise = uploadImageStream(
      s3Client,
      key,
      transformStream,
      AllowedMimeType.JPEG
    );

    await pipeline(bufferStream, transformStream);

    await uploadPromise;

    logger.info(`Object created in S3: ${key}`);
    return key;
  } catch (error) {
    logger.error(`Upload to S3 failed: ${key}`);
    throw error;
  }
}
