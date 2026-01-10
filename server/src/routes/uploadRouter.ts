import { Router } from 'express';
import { authenticate } from '@server/middleware/authenticate';
import { jsonRoute } from '@server/utils/middleware';
import { handleFile } from '@server/utils/handleFile';
import { ImageFolder } from '@server/enums/ImageFolder';
import { handleStreamUpload } from './utils/handleStreamUpload';

const uploadRouter = Router();

uploadRouter.post(
  '/recipe',
  authenticate,
  jsonRoute(async req => {
    const file = await handleFile(req);
    const key = await handleStreamUpload(file.buffer, ImageFolder.RECIPES);
    return { imageUrl: key };
  })
);

uploadRouter.post(
  '/profile',
  authenticate,
  jsonRoute(async req => {
    const file = await handleFile(req);
    const key = await handleStreamUpload(file.buffer, ImageFolder.PROFILES);

    return { image: key };
  })
);

uploadRouter.post(
  '/collection',
  authenticate,
  jsonRoute(async req => {
    const file = await handleFile(req);
    const key = await handleStreamUpload(file.buffer, ImageFolder.COLLECTIONS);

    return { imageUrl: key };
  })
);

export default uploadRouter;
