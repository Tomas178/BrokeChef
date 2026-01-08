import type { Readable } from 'node:stream';
import type { S3Client } from '@aws-sdk/client-s3';
import type { AllowedMimetypeValues } from '@server/enums/AllowedMimetype';
import { Upload } from '@aws-sdk/lib-storage';
import config from '@server/config';
import type { ImageFolderValues } from '@server/enums/ImageFolder';
import { formUniqueFilename } from '../formUniqueFilename';

export async function uploadImageStream(
  s3Client: S3Client,
  folderName: ImageFolderValues,
  bodyStream: Readable,
  contentType: AllowedMimetypeValues
) {
  const uniqueFilename = formUniqueFilename();

  const key = `${folderName}/${uniqueFilename}`;

  const parallelUpload = new Upload({
    client: s3Client,
    params: {
      Bucket: config.auth.aws.s3.buckets.images,
      Key: key,
      Body: bodyStream,
      ContentType: contentType,
    },
  });

  await parallelUpload.done();
  return key;
}
