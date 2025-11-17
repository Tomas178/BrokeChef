import { Router } from 'express';
import { ai } from '@server/utils/GoogleGenAiClient/client';
import {
  generatedRecipeSchema,
  validGenerateRecipesNumber,
} from '@server/entities/generatedRecipe';
import { resizeImage } from '@server/utils/resizeImage';
import { MIN_RECIPES_TO_GENERATE_PER_REQUEST } from '@server/shared/consts';
import * as z from 'zod';
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

    const numberOfRecipes = validGenerateRecipesNumber.parse(
      Number(request.query.number ?? MIN_RECIPES_TO_GENERATE_PER_REQUEST)
    );

    const recipes = await generateRecipesFromImage(
      ai,
      resizedFileBuffer,
      numberOfRecipes
    );
    logger.info(`Generated ${recipes.length} recipes from uploaded image`);

    const validatedRecipes = z.array(generatedRecipeSchema).parse(recipes);

    return { recipes: validatedRecipes };
  })
);

export default generateRecipesRouter;
