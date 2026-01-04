import type { RecipeJobData } from '@server/queues/recipe';
import type { Job } from 'bullmq';
import { processRecipeJob } from '../recipe';

const { eventHandlers } = vi.hoisted(() => ({
  eventHandlers: {} as Record<string, any>,
}));

const [mockLoggerInfo, mockLoggerError, mockGenerateRecipesFromImage] =
  vi.hoisted(() => [vi.fn(), vi.fn(), vi.fn()]);

vi.mock('@server/utils/GoogleGenAiClient/generateRecipesFromImage', () => ({
  generateRecipesFromImage: mockGenerateRecipesFromImage,
}));

vi.mock('@server/logger', () => ({
  default: {
    info: mockLoggerInfo,
    error: mockLoggerError,
  },
}));

vi.mock('@server/utils/redis/connection', () => ({ redisConnection: {} }));

vi.mock('bullmq', () => ({
  Worker: vi.fn(() => ({
    on: vi.fn((event, callback) => {
      eventHandlers[event] = callback;
    }),
    close: vi.fn(),
  })),
  Queue: vi.fn(),
}));

const createMockJob = (data: RecipeJobData) =>
  ({
    id: 'job-123',
    data,
  }) as Job;

describe('Recipe Worker Processor', () => {
  beforeEach(() => vi.clearAllMocks());

  const fakeImageBase64 = 'data:imageBase64';
  const fakeUserId = 'a'.repeat(32);

  it('Should process a job successfully', async () => {
    const job = createMockJob({
      imageBase64: fakeImageBase64,
      userId: fakeUserId,
    });

    await processRecipeJob(job);

    expect(mockLoggerInfo).toHaveBeenCalledWith(
      expect.stringContaining('Generated recipes')
    );
  });

  it('Should throw an error if generating fails', async () => {
    const errorMessage = 'AI failed';
    mockGenerateRecipesFromImage.mockRejectedValueOnce(new Error(errorMessage));

    const job = createMockJob({
      imageBase64: fakeImageBase64,
      userId: fakeUserId,
    });

    await expect(processRecipeJob(job)).rejects.toThrow(errorMessage);

    expect(mockLoggerError).toHaveBeenCalledWith(
      expect.stringContaining('Failed to generate')
    );
  });

  describe('Event Listeners', () => {
    it('Should log when worker is ready', () => {
      const readyCallback = eventHandlers['ready'];
      expect(readyCallback).toBeDefined();

      readyCallback();

      expect(mockLoggerInfo).toHaveBeenCalledWith(
        expect.stringContaining('Recipe worker is ready')
      );
    });

    it('Should log when worker encounters an error', () => {
      const errorCallback = eventHandlers['error'];
      expect(errorCallback).toBeDefined();

      const fakeError = new Error('Redis died');
      errorCallback(fakeError);

      expect(mockLoggerError).toHaveBeenCalledWith(
        'Recipe worker Redis connection error',
        fakeError
      );
    });
  });
});
