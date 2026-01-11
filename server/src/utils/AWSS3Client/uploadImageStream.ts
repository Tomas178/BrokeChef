import type { Readable } from 'node:stream';
import type { S3Client } from '@aws-sdk/client-s3';
import type { AllowedMimetypeValues } from '@server/enums/AllowedMimetype';
import { Upload } from '@aws-sdk/lib-storage';
import config from '@server/config';

export function uploadImageStream(
  s3Client: S3Client,
  key: string,
  bodyStream: Readable,
  contentType: AllowedMimetypeValues
) {
  return new Upload({
    client: s3Client,
    params: {
      Bucket: config.auth.aws.s3.buckets.images,
      Key: key,
      Body: bodyStream,
      ContentType: contentType,
    },
  });
}
