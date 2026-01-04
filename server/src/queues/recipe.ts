import { Queue, type DefaultJobOptions } from 'bullmq';
import { redisConnection } from '../utils/redis/connection';

export interface RecipeJobData {
  imageBase64: string;
  userId: string;
}

export const RECIPE_QUEUE_NAME = 'recipe-queue';
export const RECIPE_JOB_NAME = 'generate-recipes';

export const defaultRecipeJobOptions: DefaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
  removeOnComplete: true,
  removeOnFail: false,
};

export const recipeQueue = new Queue<RecipeJobData>(RECIPE_QUEUE_NAME, {
  connection: redisConnection,
});

export async function addRecipeJob(data: RecipeJobData) {
  await recipeQueue.add(RECIPE_JOB_NAME, data, defaultRecipeJobOptions);
}
