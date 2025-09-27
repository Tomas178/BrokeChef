import { S3Client } from '@aws-sdk/client-s3';
import config from '@server/config';
import logger from '@server/logger';

export const s3Client = new S3Client({
  region: config.auth.aws.s3.region,
  credentials: {
    accessKeyId: config.auth.aws.s3.accessIdKey,
    secretAccessKey: config.auth.aws.s3.secretAccessKey,
  },
});

logger.info('S3Client authenticated!');
