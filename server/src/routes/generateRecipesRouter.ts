import { Router } from 'express';
import { ai } from '@server/utils/GoogleGenAiClient/client';
import { resizeImage } from '@server/utils/resizeImage';
import { authenticate } from '../middleware/authenticate';
import { jsonRoute } from '../utils/middleware';
import { handleFile } from '../utils/handleFile';
import { generateRecipesFromImage } from '../utils/GoogleGenAiClient/generateRecipesFromImage';
import logger from '../logger';

const generateRecipesRouter = Router();

generateRecipesRouter.post(
  '/generate',
  authenticate,
  jsonRoute(async request => {
    const fileBuffer = await handleFile(request);
    const resizedFileBuffer = await resizeImage(fileBuffer);

    const recipes = await generateRecipesFromImage(ai, resizedFileBuffer);

    console.log(recipes);

    logger.info(`Generated ${recipes.length} recipes from uploaded image`);
    return recipes;
  })
);

export default generateRecipesRouter;
