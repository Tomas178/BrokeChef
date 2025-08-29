import { GetObjectCommand, type S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '@server/config';

export async function signUrl(s3Client: S3Client, imageUrl: string) {
  const command = new GetObjectCommand({
    Bucket: config.auth.aws.s3.buckets.images,
    Key: imageUrl,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return signedUrl;
}
