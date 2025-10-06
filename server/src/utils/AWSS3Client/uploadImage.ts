import { PutObjectCommand, type S3Client } from '@aws-sdk/client-s3';
import config from '@server/config';
import type { AllowedMimetypeValues } from '@server/enums/AllowedMimetype';
import type { ImageFolderValues } from '@server/enums/ImageFolder';
import { formUniqueFilename } from '../formUniqueFilename';

export async function uploadImage(
  s3Client: S3Client,
  folder: ImageFolderValues,
  buffer: Buffer,
  contentType: AllowedMimetypeValues
): Promise<string> {
  const uniqueFilename = formUniqueFilename();

  const key = `${folder}/${uniqueFilename}`;

  const command = new PutObjectCommand({
    Bucket: config.auth.aws.s3.buckets.images,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  return key;
}
