import { Queue } from 'bullmq';
import {
  addRecipeJob,
  defaultRecipeJobOptions,
  RECIPE_JOB_NAME,
  RECIPE_QUEUE_NAME,
  recipeQueue,
  type RecipeJobData,
} from '../recipe';

const mockAdd = vi.hoisted(() => vi.fn());
const mockQueue = vi.hoisted(() =>
  vi.fn(() => ({
    add: mockAdd,
  }))
);

vi.mock('bullmq', () => ({
  Queue: mockQueue,
}));

vi.mock('@server/utils/redis/connection', () => ({
  redisConnection: {},
}));

describe('Recipe Queue', () => {
  beforeEach(() => mockAdd.mockClear());

  it('Should initialize the Queue with the correct name', () => {
    expect(Queue).toHaveBeenCalledWith(
      RECIPE_QUEUE_NAME,
      expect.objectContaining({
        connection: expect.any(Object),
      })
    );
  });

  it('addRecipeJob should add a job to the queue with default options', async () => {
    const mockData: RecipeJobData = {
      imageBase64: 'data:imageBase64',
      userId: 'a'.repeat(32),
    };

    await addRecipeJob(mockData);

    expect(recipeQueue.add).toHaveBeenCalledExactlyOnceWith(
      RECIPE_JOB_NAME,
      mockData,
      expect.objectContaining(defaultRecipeJobOptions)
    );
  });
});
