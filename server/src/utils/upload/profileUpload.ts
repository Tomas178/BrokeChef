import { ImageFolder } from '@server/enums/ImageFolder';
import { s3Client } from '../AWSS3Client/client';
import { makeUploader } from './makeUploader';

export const profileUpload = makeUploader(ImageFolder.PROFILES, s3Client);
