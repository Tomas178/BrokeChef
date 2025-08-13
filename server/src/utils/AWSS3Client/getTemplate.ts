import type { Readable } from 'node:stream';
import { GetObjectCommand, type S3Client } from '@aws-sdk/client-s3';

type EmailTemplates = 'verifyEmail.html' | 'resetPassword.html';

async function streamToString(stream: Readable): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

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

  return streamToString(response.Body as Readable);
}
