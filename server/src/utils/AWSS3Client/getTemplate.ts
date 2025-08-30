import { GetObjectCommand, type S3Client } from '@aws-sdk/client-s3';
import type { EmailTemplatesKeys } from '@server/enums/EmailTemplate';

export async function getTemplate(
  s3Client: S3Client,
  bucketName: string,
  key: EmailTemplatesKeys
) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const response = await s3Client.send(command);

  if (!response.Body) {
    throw new Error('File not found in AWS S3!');
  }

  const htmlContent = await response.Body.transformToString();

  return htmlContent;
}
