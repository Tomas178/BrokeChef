import multer from 'multer';
import multerS3 from 'multer-s3';
import config from '@server/config';
import type { S3Client } from '@aws-sdk/client-s3';

type Folders = 'Recipes' | 'Profiles';

export function makeUploader(folder: Folders, awsS3Client: S3Client) {
  return multer({
    storage: multerS3({
      s3: awsS3Client,
      bucket: config.auth.aws.s3.buckets.images,
      metadata: (_request, file, callback) => {
        callback(undefined, { fieldName: file.fieldname });
      },
      key: (_request, file, callback) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        callback(undefined, `${folder}/${uniqueName}`);
      },
    }),
  });
}
