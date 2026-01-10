import { pipeline } from 'node:stream/promises';
import type { ImageFolderValues } from '@server/enums/ImageFolder';
import { formUniqueFilename } from '@server/utils/formUniqueFilename';
import Busboy from 'busboy';
import { createTransformStream } from '@server/utils/createTransformStream';
import { uploadImageStream } from '@server/utils/AWSS3Client/uploadImageStream';
import { s3Client } from '@server/utils/AWSS3Client/client';
import { AllowedMimeType } from '@server/enums/AllowedMimetype';
import logger from '@server/logger';
import type { Request } from 'express';
import { FileSizeValidator } from './FileSizeValidator';

export async function handleStreamUpload(
  req: Request,
  folderName: ImageFolderValues
) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers });
    const uniqueFilename = formUniqueFilename();
    const key = `${folderName}/${uniqueFilename}`;
    let isUploadStarted = false;

    busboy.on('file', async (_, fileStream) => {
      isUploadStarted = true;

      const fileSizeValidator = new FileSizeValidator();
      const transformStream = createTransformStream();

      try {
        const uploadPromise = uploadImageStream(
          s3Client,
          key,
          transformStream,
          AllowedMimeType.JPEG
        );

        const pipelinePromise = pipeline(
          fileStream,
          fileSizeValidator,
          transformStream
        );

        await pipelinePromise;
        await uploadPromise;

        resolve(key);
      } catch (error) {
        logger.error(`Upload failed for ${key}`);
        transformStream.destroy();
        fileStream.resume();
        reject(error);
      }
    });

    busboy.on('error', error => {
      logger.error(`Busboy error: ${error}`);
    });

    busboy.on('finish', () => {
      if (!isUploadStarted) {
        reject(new Error('No file found in request'));
      }
    });

    req.pipe(busboy);
  });
}
