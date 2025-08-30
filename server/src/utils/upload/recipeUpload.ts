import { ImageFolder } from '@server/enums/ImageFolder';
import { s3Client } from '../AWSS3Client/client';
import { makeUploader } from './makeUploader';

export const recipeUpload = makeUploader(ImageFolder.RECIPES, s3Client);
