import { s3Client } from '../AWSS3Client/client';
import { makeUploader } from './makeUploader';

export const recipeUpload = makeUploader('Recipes', s3Client);
