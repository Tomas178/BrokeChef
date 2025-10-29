import type { Request } from 'express';
import { MulterError } from 'multer';
import logger from '@server/logger';
import ImageTooLarge from './errors/images/ImageTooLarge';
import WrongImageType from './errors/images/WrongImageType';
import { upload } from './upload';

export async function handleFile(
  request: Request
): Promise<Express.Multer.File> {
  return new Promise((resolve, reject) => {
    upload.single('file')(request, {} as never, error => {
      if (error) {
        if (error instanceof MulterError && error.code === 'LIMIT_FILE_SIZE') {
          logger.error(
            `User with ID: ${request.user?.id} tried to upload too large image`
          );
          return reject(new ImageTooLarge());
        }

        if (error instanceof WrongImageType) {
          logger.error(
            `User with ID: ${request.user?.id} tried to upload wrong file type`
          );
          return reject(error);
        }

        return reject(error);
      }

      if (!request.file) {
        return reject(new WrongImageType());
      }

      resolve(request.file);
    });
  });
}
