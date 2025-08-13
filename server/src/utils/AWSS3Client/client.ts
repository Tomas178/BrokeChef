import { S3Client } from '@aws-sdk/client-s3';
import config from '@server/config';

export const s3Client = new S3Client({
  region: config.auth.aws.s3.region,
  credentials: {
    accessKeyId: config.auth.aws.accessIdKey,
    secretAccessKey: config.auth.aws.secretAccessKey,
  },
});

console.log('S3Client authenticated!');
