import config from '@server/config';
import { s3Client } from '@server/utils/AWSS3Client/client';
import { deleteFile } from '@server/utils/AWSS3Client/deleteFile';
import logger from '@server/logger';

export async function rollbackImageUpload(imageUrl: string): Promise<void> {
  try {
    await deleteFile(s3Client, config.auth.aws.s3.buckets.images, imageUrl);
  } catch (error) {
    logger.error('Failed to rollback S3 Object:', error);
  }
}
