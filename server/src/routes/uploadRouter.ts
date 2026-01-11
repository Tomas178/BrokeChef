import { Router } from 'express';
import { authenticate } from '@server/middleware/authenticate';
import { jsonRoute } from '@server/utils/middleware';
import { ImageFolder } from '@server/enums/ImageFolder';
import { handleFileStream } from '@server/utils/handleFileStream';
import { handleStreamUpload } from './utils/handleStreamUpload';

const uploadRouter = Router();

uploadRouter.post(
  '/recipe',
  authenticate,
  jsonRoute(async req => {
    const { stream } = await handleFileStream(req);
    const key = await handleStreamUpload(stream, ImageFolder.RECIPES);
    return { imageUrl: key };
  })
);

uploadRouter.post(
  '/profile',
  authenticate,
  jsonRoute(async req => {
    const { stream } = await handleFileStream(req);
    const key = await handleStreamUpload(stream, ImageFolder.PROFILES);

    return { image: key };
  })
);

uploadRouter.post(
  '/collection',
  authenticate,
  jsonRoute(async req => {
    const { stream } = await handleFileStream(req);
    const key = await handleStreamUpload(stream, ImageFolder.COLLECTIONS);

    return { imageUrl: key };
  })
);

export default uploadRouter;
