/* eslint-disable unicorn/no-null */
import multer from 'multer';
import multerS3 from 'multer-s3';
import config from '@server/config';
import type { S3Client } from '@aws-sdk/client-s3';
import { ALLOWED_MIMETYPE } from '@server/enums/AllowedMimetype';
import { formUniqueFilename } from '../formUniqueFilename';

export type Folders = 'Recipes' | 'Profiles';

export function makeUploader(folder: Folders, awsS3Client: S3Client) {
  return multer({
    storage: multerS3({
      s3: awsS3Client,
      bucket: config.auth.aws.s3.buckets.images,
      metadata: (_request, file, callback) => {
        callback(null, { fieldName: file.fieldname });
      },
      key: (_request, file, callback) => {
        const uniqueName = formUniqueFilename(file.originalname);
        callback(null, `${folder}/${uniqueName}`);
      },
    }),
    fileFilter: (request, file, callback) => {
      if (
        file.mimetype === ALLOWED_MIMETYPE.PNG ||
        file.mimetype === ALLOWED_MIMETYPE.JPEG
      ) {
        callback(null, true);
      } else {
        request.fileValidationError =
          'Supported types for image are .png, .jpg or .jpeg';
        callback(null, false);
      }
    },
    limits: { files: 1, fileSize: 5 * 1024 * 1024 }, // 5MB
  });
}
