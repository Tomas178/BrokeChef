import { DeleteObjectCommand, type S3Client } from '@aws-sdk/client-s3';

export async function deleteFile(
  s3Client: S3Client,
  bucket: string,
  key: string
) {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  try {
    await s3Client.send(command);
  } catch {
    throw new Error('Failed to delete the image inside S3');
  }
}
