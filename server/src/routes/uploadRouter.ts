import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { jsonRoute } from '../utils/middleware';
import { ImageFolder } from '../enums/ImageFolder';
import { handleStreamUpload } from './utils/handleStreamUpload';

const uploadRouter = Router();

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
