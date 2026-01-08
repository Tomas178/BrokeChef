import { Router, type Request } from 'express';
import sharp from 'sharp';
import { uploadImageStream } from '@server/utils/AWSS3Client/uploadImageStream';
import { formUniqueFilename } from '@server/utils/formUniqueFilename';
import { authenticate } from '../middleware/authenticate';
import { jsonRoute } from '../utils/middleware';
import { s3Client } from '../utils/AWSS3Client/client';
import { ImageFolder, type ImageFolderValues } from '../enums/ImageFolder';
import { AllowedMimeType } from '../enums/AllowedMimetype';
import logger from '../logger';

const uploadRouter = Router();

async function handleStreamUpload(req: Request, folderName: ImageFolderValues) {
  const uniqueFilename = formUniqueFilename();
  const key = `${folderName}/${uniqueFilename}`;

  const transformStream = sharp().resize({ width: 1080, height: 1920 }).jpeg({
    quality: 80,
    mozjpeg: true,
  });

  const uploadPromise = uploadImageStream(
    s3Client,
    key,
    transformStream,
    AllowedMimeType.JPEG
  );

  req.pipe(transformStream);

  await uploadPromise;

  logger.info(`Object created in S3: ${key}`);
  return key;
}

uploadRouter.post(
  '/recipe',
  authenticate,
  jsonRoute(async req => {
    const key = await handleStreamUpload(req, ImageFolder.RECIPES);
    return { imageUrl: key };
  })
);

uploadRouter.post(
  '/profile',
  authenticate,
  jsonRoute(async req => {
    const key = await handleStreamUpload(req, ImageFolder.PROFILES);
    return { image: key };
  })
);

uploadRouter.post(
  '/collection',
  authenticate,
  jsonRoute(async req => {
    const key = await handleStreamUpload(req, ImageFolder.COLLECTIONS);
    return { imageUrl: key };
  })
);

export default uploadRouter;
