import { PutObjectCommand, type S3Client } from '@aws-sdk/client-s3';
import config from '@server/config';
import type { AllowedMimetypeKeys } from '@server/enums/AllowedMimetype';
import type { ImageFolderKeys } from '@server/enums/ImageFolder';

export async function uploadImage(
  s3Client: S3Client,
  folder: ImageFolderKeys,
  filename: string,
  buffer: Buffer,
  contentType: AllowedMimetypeKeys
) {
  const key = `${folder}/${filename}`;

  const command = new PutObjectCommand({
    Bucket: config.auth.aws.s3.buckets.images,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);
}
