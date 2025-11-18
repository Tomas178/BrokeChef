import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { jsonRoute } from '../utils/middleware';
import { handleFile } from '../utils/handleFile';
import { resizeImage } from '../utils/resizeImage';
import { uploadImage } from '../utils/AWSS3Client/uploadImage';
import { s3Client } from '../utils/AWSS3Client/client';
import { ImageFolder } from '../enums/ImageFolder';
import { AllowedMimeType } from '../enums/AllowedMimetype';
import logger from '../logger';

const uploadRouter = Router();

uploadRouter.post(
  '/recipe',
  authenticate,
  jsonRoute(async request => {
    const file = await handleFile(request);
    const resizedFileBuffer = await resizeImage(file);
    const key = await uploadImage(
      s3Client,
      ImageFolder.RECIPES,
      resizedFileBuffer,
      AllowedMimeType.JPEG
    );

    logger.info(`Recipe image object created in S3: ${key}`);
    return { imageUrl: key };
  })
);

uploadRouter.post(
  '/profile',
  authenticate,
  jsonRoute(async request => {
    const file = await handleFile(request);
    const resizedFileBuffer = await resizeImage(file);
    const key = await uploadImage(
      s3Client,
      ImageFolder.PROFILES,
      resizedFileBuffer,
      AllowedMimeType.JPEG
    );

    logger.info(`Profile image object created in S3: ${key}`);
    return { image: key };
  })
);

uploadRouter.post(
  '/collection',
  authenticate,
  jsonRoute(async request => {
    const file = await handleFile(request);
    const resizedFileBuffer = await resizeImage(file);
    const key = await uploadImage(
      s3Client,
      ImageFolder.COLLECTIONS,
      resizedFileBuffer,
      AllowedMimeType.JPEG
    );

    logger.info(`Collection image object created in S3: ${key}`);
    return { imageUrl: key };
  })
);

export default uploadRouter;
