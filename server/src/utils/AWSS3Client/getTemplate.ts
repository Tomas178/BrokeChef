import { GetObjectCommand, type S3Client } from '@aws-sdk/client-s3';

type EmailTemplates = 'verifyEmail.html' | 'resetPassword.html';

export async function getTemplate(
  s3Client: S3Client,
  bucketName: string,
  key: EmailTemplates
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
