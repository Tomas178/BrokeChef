import { S3Client } from '@aws-sdk/client-s3';
import config from '@server/config';
import logger from '@server/logger';
import { GracefulShutdownPriority } from '@server/enums/GracefulShutdownPriority';
import { gracefulShutdownManager } from '../GracefulShutdownManager';

export const s3Client = new S3Client({
  region: config.auth.aws.s3.region,
  credentials: {
    accessKeyId: config.auth.aws.s3.accessIdKey,
    secretAccessKey: config.auth.aws.s3.secretAccessKey,
  },
});

/* v8 ignore start */
gracefulShutdownManager.registerCleanup(
  'S3 Client',
  () => {
    s3Client.destroy();
  },
  GracefulShutdownPriority.INFRASTRUCTURE
);
/* v8 ignore stop */

logger.info('S3Client authenticated!');
