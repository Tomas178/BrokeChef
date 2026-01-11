import type { Readable } from 'node:stream';
import type { Request } from 'express';
import Busboy from 'busboy';
import { MAX_FILE_SIZE } from '@server/shared/consts';
import { allowedMimetypesArray } from '@server/enums/AllowedMimetype';
import type { AllowedMimetypeValues } from '../enums/AllowedMimetype';
import WrongImageType from './errors/images/WrongImageType';
import ImageTooLarge from './errors/images/ImageTooLarge';

interface StreamedFile {
  stream: Readable;
  filename: string;
  mimetype: AllowedMimetypeValues;
}

export async function handleFileStream(req: Request): Promise<StreamedFile> {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: req.headers,
      limits: { fileSize: MAX_FILE_SIZE },
    });

    let isSettled = false;

    busboy.on('file', (_, fileStream, info) => {
      const { filename, mimeType } = info;

      if (!allowedMimetypesArray.includes(mimeType)) {
        isSettled = true;
        fileStream.resume();
        return reject(new WrongImageType());
      }

      fileStream.on('limit', () => {
        isSettled = true;
        reject(new ImageTooLarge());
      });

      setImmediate(() => {
        if (!isSettled) {
          const streamedFile: StreamedFile = {
            stream: fileStream,
            filename,
            mimetype: mimeType as AllowedMimetypeValues,
          };

          resolve(streamedFile);
        }
      });
    });

    busboy.on('error', error => {
      if (!isSettled) reject(error);
    });

    req.pipe(busboy);
  });
}
