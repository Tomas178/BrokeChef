import { GracefulShutdownPriority } from '@server/enums/GracefulShutdownPriority';
import { RecipeGenerationStatus } from '@server/enums/RecipeGenerationStatus';
import logger from '@server/logger';
import { RECIPE_QUEUE_NAME, type RecipeJobData } from '@server/queues/recipe';
import { ai } from '@server/utils/GoogleGenAiClient/client';
import { generateRecipesFromImage } from '@server/utils/GoogleGenAiClient/generateRecipesFromImage';
import { gracefulShutdownManager } from '@server/utils/GracefulShutdownManager';
import { redisConnection } from '@server/utils/redis/connection';
import {
  sseManager,
  type ErrorRecipeData,
  type SuccessRecipeData,
} from '@server/utils/SSE';
import { Worker, type Job } from 'bullmq';

export async function processRecipeJob(job: Job<RecipeJobData>) {
  const { imageBase64, userId } = job.data;

  try {
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    const recipes = await generateRecipesFromImage(ai, imageBuffer);

    const successData: SuccessRecipeData = {
      status: RecipeGenerationStatus.SUCCESS,
      recipes,
    };

    sseManager.sendToClient(userId, successData);

    logger.info(`Generated recipes successfully sent to: ${userId}`);
  } catch (error) {
    const errorData: ErrorRecipeData = {
      status: RecipeGenerationStatus.ERROR,
      message: 'Failed to generate recipe from your image',
    };

    sseManager.sendToClient(userId, errorData);
    logger.error(`Failed to generate recipes and send them to: ${userId}`);

    throw error;
  }
}

export const recipeWorker = new Worker<RecipeJobData>(
  RECIPE_QUEUE_NAME,
  processRecipeJob,
  {
    connection: redisConnection,
  }
);

/* v8 ignore start */
gracefulShutdownManager.registerCleanup(
  'recipe worker',
  async () => {
    await recipeWorker.close();
  },
  GracefulShutdownPriority.WORKER
);
/* v8 ignore stop */

recipeWorker.on('ready', () => {
  logger.info(
    `Recipe worker is ready! Connected to Redis and listening on ${RECIPE_QUEUE_NAME}`
  );
});

recipeWorker.on('error', error => {
  logger.error('Recipe worker Redis connection error', error);
});
