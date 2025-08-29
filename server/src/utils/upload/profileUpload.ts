import { s3Client } from '../AWSS3Client/client';
import { makeUploader } from './makeUploader';

export const profileUpload = makeUploader('Profiles', s3Client);
